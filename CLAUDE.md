# CLAUDE.md — AI Assistant Guide for qa_demo_cypress_ts

This file describes the codebase structure, development workflows, and conventions for AI assistants working in this repository.

---

## Project Overview

**Purpose:** End-to-end (E2E) test suite for the [OrangeHRM demo application](https://opensource-demo.orangehrmlive.com) using Cypress 14, TypeScript, Docker, and GitHub Actions.

**Application Under Test:** OrangeHRM open-source HR management system (demo instance).

---

## Repository Layout

```
qa_demo_cypress_ts/
├── .github/workflows/cypress.yml   # GitHub Actions CI pipeline
├── docker/entrypoint.sh            # Docker container entrypoint
├── dockerfile                      # Dockerfile for test execution
├── .dockerignore
├── README.md
└── orangehrm-cypress/              # Main Cypress project root
    ├── cypress/
    │   ├── e2e/                    # Test specs, organized by feature
    │   │   ├── auth/
    │   │   │   └── login_negative.cy.ts
    │   │   └── claim/
    │   │       ├── claim_assign_after_login.cy.ts
    │   │       └── claim_nav_menu.cy.ts
    │   ├── fixtures/
    │   │   └── credentials.json    # Test credentials
    │   └── support/
    │       └── e2e.ts              # Cypress support entry point
    ├── src/
    │   └── pages/                  # Page Object Model (POM) classes
    │       ├── BasePage.ts
    │       ├── LoginPage.ts
    │       ├── DashboardPage.ts
    │       ├── ClaimAssignPage.ts
    │       └── Sidebar.ts
    ├── cypress.config.ts
    ├── tsconfig.json
    └── package.json
```

---

## Development Commands

All commands must be run from `orangehrm-cypress/`:

```bash
cd orangehrm-cypress

npm run cy:open   # Open Cypress interactive runner (local dev)
npm run cy:run    # Run all tests headlessly
npm test          # Alias for cy:run
```

**Docker execution (from repo root):**

```bash
docker build --build-arg PROJECT_DIR=orangehrm-cypress -t qa-cypress:chrome .
docker run --rm --shm-size=2g qa-cypress:chrome
```

---

## Cypress Configuration (`cypress.config.ts`)

| Setting | Local | CI |
|---|---|---|
| `baseUrl` | `https://opensource-demo.orangehrmlive.com` | same |
| `defaultCommandTimeout` | 6 000 ms | 10 000 ms |
| `pageLoadTimeout` | 30 000 ms | 60 000 ms |
| `retries.runMode` | 0 | 2 |
| `video` | true | true |
| `screenshotOnRunFailure` | true | true |
| `viewportWidth` | 1366 | 1366 |
| `viewportHeight` | 800 | 800 |

Timeouts and retries are toggled automatically based on the `CI` environment variable.

---

## TypeScript Configuration

- **Target:** ES2021, `commonjs` modules
- **Strict mode:** enabled
- **Path aliases:**
  - `@pages/*` → `src/pages/*`
  - `@support/*` → `cypress/support/*`
- **Includes:** `cypress/` and `src/` directories

Prefer path aliases over relative imports when importing page objects in test files.

---

## Architecture: Page Object Model (POM)

All UI interactions are encapsulated in page classes under `src/pages/`. Test specs only call page object methods — they do not contain raw `cy.get()` calls.

### Class Hierarchy

```
BasePage (abstract)
├── LoginPage
├── DashboardPage
├── ClaimAssignPage
└── Sidebar        ← does NOT extend BasePage (no navigable path)
```

### BasePage (`src/pages/BasePage.ts`)

```typescript
export abstract class BasePage {
    protected abstract path: string;
    open(): void { cy.visit(this.path); }
}
```

Every page that can be directly visited extends `BasePage` and defines a `path` string.

### Page Object Conventions

| Convention | Example |
|---|---|
| One class per page/component | `LoginPage`, `DashboardPage` |
| `protected path` defines the URL segment | `"/web/index.php/auth/login"` |
| `open()` navigates directly to the page | `loginPage.open()` |
| `login()` combines open + fill + submit | `loginPage.login(user, pass)` |
| `assertLoaded()` / `assertLoggedIn()` verify the page state | URL + element checks |
| Passwords use `{ log: false }` | `cy.type(pass, { log: false })` |

### Adding a New Page Object

1. Create `src/pages/MyFeaturePage.ts` extending `BasePage`.
2. Define `protected path = "/web/index.php/..."`.
3. Add interaction methods (`fillX`, `clickY`) and assertion methods (`assertLoaded`).
4. Import and instantiate in the relevant spec file.

---

## Test Conventions

### File Naming

- Spec files: `cypress/e2e/<feature>/<name>.cy.ts`
- Group related tests under the same feature directory (`auth/`, `claim/`, etc.)

### Test Structure

```typescript
import { LoginPage } from "../../../src/pages/LoginPage";

describe("Feature — scenario description", () => {
    const page = new LoginPage();         // instantiate POM at describe level

    it("does something specific", () => {
        cy.fixture("credentials.json").then(({ orangehrm }) => {
            page.login(orangehrm.username, orangehrm.password);
            page.assertSomething();
        });
    });
});
```

### Selector Strategy (in order of preference)

1. `cy.get('[name="fieldName"]')` — stable attribute selectors
2. `cy.contains('button.oxd-button', /text/i)` — text + class
3. `cy.contains('[role="navigation"] a', /label/i)` — role + text
4. Avoid `cy.get('.class')` alone (fragile class names)

### Assertions

- Prefer `cy.url().should("include", "/path")` for navigation checks.
- Use `cy.title().should("contain", "OrangeHRM")` for page load verification.
- Use `cy.contains(...).should("be.visible")` for UI element presence.
- API sanity: `cy.request(path).its("status").should("eq", 200)`.

---

## Fixture Data

**`cypress/fixtures/credentials.json`**

```json
{
  "orangehrm": {
    "username": "Admin",
    "password": "admin123"
  }
}
```

Access in tests with `cy.fixture("credentials.json").then(({ orangehrm }) => { ... })`.

In CI the credentials can be overridden via `ORANGEHRM_USERNAME` and `ORANGEHRM_PASSWORD` environment variables (GitHub Actions secrets).

---

## CI/CD Pipeline (`.github/workflows/cypress.yml`)

**Triggers:** push/PR to `main` or `master`; manual `workflow_dispatch`.

**Steps:**
1. Checkout code.
2. Build Docker image with `--build-arg PROJECT_DIR=orangehrm-cypress`.
3. Run Cypress inside Docker (`--shm-size=2g`, Chromium browser).
4. Upload `cypress/screenshots` and `cypress/videos` as artifacts (7-day retention).

**Secrets required:**
- `ORANGEHRM_USERNAME`
- `ORANGEHRM_PASSWORD`

---

## Docker

The Dockerfile builds a `node:20-bookworm` image with Chromium and all system dependencies pre-installed. The Cypress binary is cached during the image build.

The entrypoint (`docker/entrypoint.sh`) runs:

```bash
npx cypress run \
  --browser "${BROWSER:-chromium}" \
  --spec "${SPECS:-cypress/e2e/**/*.cy.ts}" \
  --config video=true
```

Override browser or spec pattern via `BROWSER` and `SPECS` environment variables.

---

## Key Conventions Summary

| Rule | Detail |
|---|---|
| All UI interactions in POM classes | No raw `cy.get()` in spec files |
| Test credentials in fixtures | `cypress/fixtures/credentials.json` |
| Feature-based directory grouping | `cypress/e2e/<feature>/` |
| Spec file suffix | `.cy.ts` |
| Stable selectors preferred | `[name=...]`, `[role=...]` over class names |
| Passwords masked in logs | `cy.type(pass, { log: false })` |
| CI timeouts/retries auto-detected | via `process.env.CI` in `cypress.config.ts` |
| Docker for reproducible runs | `node:20-bookworm` + Chromium |

---

## Adding New Tests — Checklist

- [ ] Create (or reuse) a page object in `src/pages/`
- [ ] Place the spec in `cypress/e2e/<feature>/` with a `.cy.ts` suffix
- [ ] Load credentials via `cy.fixture("credentials.json")`, not hardcoded
- [ ] Use `assertLoaded()` / `assertLoggedIn()` from POM instead of inline assertions
- [ ] Ensure selectors are stable (attribute or role-based)
- [ ] Test locally with `npm run cy:open` before committing

---

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| `cypress` | ^14.5.4 | E2E test framework |
| `typescript` | ^5.9.2 | Type-safe test authoring |
| `ts-node` | ^10.9.2 | TypeScript execution for config files |
| `@types/node` | ^24.3.0 | Node.js type definitions |

There are no production dependencies — this is a test-only project.

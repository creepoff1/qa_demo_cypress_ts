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
    │   │   │   ├── login_negative.cy.ts
    │   │   │   └── login_positive.cy.ts
    │   │   ├── claim/
    │   │   │   ├── claim_assign_after_login.cy.ts
    │   │   │   └── claim_nav_menu.cy.ts
    │   │   └── dashboard/
    │   │       └── dashboard.cy.ts
    │   ├── fixtures/
    │   │   └── credentials.json    # Test credentials
    │   └── support/
    │       ├── commands.ts         # Custom Cypress commands (cy.login, cy.loginAsAdmin)
    │       ├── index.d.ts          # TypeScript declarations for custom commands
    │       └── e2e.ts              # Cypress support entry point (imports commands)
    ├── src/
    │   ├── pages/                  # Page Object Model (POM) classes
    │   │   ├── BasePage.ts
    │   │   ├── LoginPage.ts
    │   │   ├── DashboardPage.ts
    │   │   ├── ClaimAssignPage.ts
    │   │   └── Sidebar.ts
    │   └── types/
    │       └── fixtures.ts         # TypeScript interfaces for fixture data
    ├── .eslintrc.json              # ESLint configuration
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
npm run lint      # Lint all TypeScript source files
```

After adding ESLint packages, run `npm install` once:
```bash
npm install
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

> **Note:** Path aliases work for type checking only. Cypress's bundler does not resolve
> them at runtime — use relative imports in spec files.

---

## Architecture: Page Object Model (POM)

All UI interactions are encapsulated in page classes under `src/pages/`. Test specs only call page object methods and custom commands — they contain no raw `cy.get()` calls.

### Class Hierarchy

```
BasePage (abstract)
├── LoginPage
├── DashboardPage
├── ClaimAssignPage
└── Sidebar         ← utility class, does NOT extend BasePage
```

### BasePage (`src/pages/BasePage.ts`)

```typescript
export abstract class BasePage {
    protected abstract readonly path: string;
    open(): this { cy.visit(this.path); return this; }
}
```

Every navigable page extends `BasePage` and defines a `path`. `open()` returns `this` to enable method chaining.

### Fluent Interface (Method Chaining)

All page object methods return `this`, enabling readable call chains:

```typescript
loginPage
    .open()
    .fillUsername("Admin")
    .fillPassword("wrong-pass")
    .submit()
    .assertErrorVisible(/Invalid credentials/)
    .assertOnLoginPage();
```

### Centralized Selectors

Each page class exposes a `readonly selectors` object. Update one place when the app's markup changes:

```typescript
readonly selectors = {
    usernameInput: 'input[name="username"]',
    passwordInput: 'input[name="password"]',
    loginButton:   "button.oxd-button",
} as const;
```

### Adding a New Page Object

1. Create `src/pages/MyFeaturePage.ts` extending `BasePage`.
2. Define `protected readonly path = "/web/index.php/..."`.
3. Add a `readonly selectors = { ... } as const` object.
4. Add interaction methods returning `this` and assertion methods returning `this`.
5. Import and instantiate in the relevant spec file.

---

## Custom Cypress Commands (`cypress/support/commands.ts`)

### `cy.login(username, password)`

Wraps login in `cy.session()` for cookie caching. Login UI is executed only once per run; subsequent calls restore the cached session instantly.

```typescript
cy.login("Admin", "admin123");
```

- `cacheAcrossSpecs: true` — session is shared across ALL spec files in a run.
- `validate` callback — verifies the session is still active before reusing it.

### `cy.loginAsAdmin()`

Reads credentials from `fixtures/credentials.json` and calls `cy.login()`.

```typescript
cy.loginAsAdmin();
```

### TypeScript Declarations (`cypress/support/index.d.ts`)

Custom command types are declared in `Cypress.Chainable` so TypeScript and IDE autocomplete recognise them everywhere.

---

## Test Conventions

### File Naming

- Spec files: `cypress/e2e/<feature>/<name>.cy.ts`
- Group related tests under the same feature directory (`auth/`, `claim/`, `dashboard/`, etc.)

### Test Structure

```typescript
import { DashboardPage } from "../../../src/pages/DashboardPage";

describe("Feature — scenario description", () => {
    const dashboard = new DashboardPage();   // instantiate POM at describe level

    beforeEach(() => {
        cy.loginAsAdmin();                   // cached login — fast
        dashboard.open();
    });

    it("does something specific", () => {
        dashboard.assertLoggedIn();
    });
});
```

### Login in Tests

**Always** use `cy.loginAsAdmin()` (or `cy.login()`) in `beforeEach` instead of manually navigating through the login form. This uses `cy.session()` and is dramatically faster.

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

## Fixture Data & Types

**`cypress/fixtures/credentials.json`**

```json
{
  "orangehrm": {
    "username": "Admin",
    "password": "admin123"
  }
}
```

**`src/types/fixtures.ts`** — type-safe interface:

```typescript
export interface CredentialsFixture {
    orangehrm: OrangeHRMCredentials;
}
```

Use typed fixture loading:

```typescript
cy.fixture<CredentialsFixture>("credentials.json").then(({ orangehrm }) => { ... });
```

In CI, credentials can be overridden via `ORANGEHRM_USERNAME` and `ORANGEHRM_PASSWORD` environment variables (GitHub Actions secrets).

---

## ESLint (`.eslintrc.json`)

```bash
npm run lint
```

Rules enabled:
- `@typescript-eslint/recommended` — TypeScript best practices
- `cypress/no-unnecessary-waiting` — ban hardcoded `cy.wait(ms)` calls
- `cypress/assertion-before-screenshot` — require assertions before screenshots
- `cypress/no-assigning-return-values` — Cypress chains are not regular return values

Run `npm install` once after cloning to install ESLint packages.

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
| Login via `cy.loginAsAdmin()` | Uses `cy.session()` — cached, fast |
| All UI interactions in POM classes | No raw `cy.get()` in spec files |
| Page methods return `this` | Enables fluent method chaining |
| Selectors centralized in `page.selectors` | One place to update when markup changes |
| Test credentials in fixtures | `cypress/fixtures/credentials.json` |
| Feature-based directory grouping | `cypress/e2e/<feature>/` |
| Spec file suffix | `.cy.ts` |
| Passwords masked in logs | `cy.type(pass, { log: false })` |
| CI timeouts/retries auto-detected | via `process.env.CI` in `cypress.config.ts` |
| Docker for reproducible runs | `node:20-bookworm` + Chromium |

---

## Adding New Tests — Checklist

- [ ] Create (or reuse) a page object in `src/pages/` with `readonly selectors` and methods returning `this`
- [ ] Place the spec in `cypress/e2e/<feature>/` with a `.cy.ts` suffix
- [ ] Use `cy.loginAsAdmin()` in `beforeEach`, not inline login
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
| `eslint` | ^9.0.0 | Code linting |
| `@typescript-eslint/parser` | ^8.0.0 | TypeScript ESLint parser |
| `@typescript-eslint/eslint-plugin` | ^8.0.0 | TypeScript lint rules |
| `eslint-plugin-cypress` | ^3.0.0 | Cypress-specific lint rules |

There are no production dependencies — this is a test-only project.

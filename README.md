## OrangeHRM E2E — Cypress + TypeScript + Docker + GitHub Actions

End-to-end tests for the OrangeHRM demo app.
Stack: Cypress 14 + TypeScript + Page Object Model (POM). Runs locally, in Docker (Chromium), and on GitHub Actions with screenshots & videos as artifacts.

## 🔧 Quick Start
A) Local (Node):
```
cd orangehrm-cypress
npm ci        # or: npm install
npx cypress open
# headless:
npx cypress run
```
B) Docker (Chromium by default)
Build from repo root (project lives in orangehrm-cypress/):
```
docker build -t qa-cypress:chromium --build-arg PROJECT_DIR=orangehrm-cypress .
```
Run tests:
```
docker run --rm --shm-size=2g --ipc=host \
  -e ORANGEHRM_USERNAME=Admin \
  -e ORANGEHRM_PASSWORD=admin123 \
  -e BROWSER=chromium \
  -e SPECS="cypress/e2e/**/*.cy.ts" \
  -v "$PWD/artifacts/videos:/e2e/cypress/videos" \
  -v "$PWD/artifacts/screenshots:/e2e/cypress/screenshots" \
  qa-cypress:chromium
```
## 🗂️ Project Structure
```
.
├─ .github/workflows/
│  └─ cypress-docker.yml        # CI: Docker run + artifacts
├─ Dockerfile
├─ docker/
│  └─ entrypoint.sh             # Cypress runner inside the container
└─ orangehrm-cypress/           # Test project root
   ├─ cypress/
   │  ├─ e2e/
   │  │  └─ claim/
   │  │     ├─ claim_assign_open.cy.ts
   │  │     └─ claim_assign_after_login.cy.ts
   │  ├─ fixtures/
   │  │  └─ credentials.json
   │  └─ support/
   ├─ src/
   │  └─ pages/                 # POM
   │     ├─ BasePage.ts
   │     ├─ LoginPage.ts
   │     ├─ DashboardPage.ts
   │     └─ ClaimAssignPage.ts
   ├─ cypress.config.ts
   └─ tsconfig.json
```
## 🧱 Test Architecture (POM)
BasePage - shared helpers (open(), origin asserts, etc.).

- LoginPage - login actions & checks.

- DashboardPage - post-login assertions.

- ClaimAssignPage - navigation & checks for Assign Claim.

Example scenarios:

- Smoke: app responds / redirects to login.

- Auth: valid/invalid login, logout.

- Navigation: open Assign Claim (via URL or menu).

## 🧪 Useful Commands
Cypress (local)
```
# open interactive runner
npx cypress open

# headless: run all specs
npx cypress run

# headless: run a single spec
npx cypress run --spec "cypress/e2e/claim/claim_assign_after_login.cy.ts"
```
Docker
```# all specs
docker run ... -e SPECS="cypress/e2e/**/*.cy.ts" qa-cypress:chromium

# single spec
docker run ... -e SPECS="cypress/e2e/claim/claim_assign_open.cy.ts" qa-cypress:chromium
```
## 🤖 GitHub Actions (Docker, Chromium)

Workflow cypress-docker.yml:

- builds a Docker image with dependencies and preinstalled Cypress,

- runs tests in a container (Chromium),

- uploads screenshots and videos as artifacts.

Secrets (optional):

ORANGEHRM_USERNAME, ORANGEHRM_PASSWORD.

### ⚙️ Config & Stability Tips

baseUrl: "https://opensource-demo.orangehrmlive.com" in cypress.config.ts.

Higher timeouts & retries for CI (external demo apps can be flaky):

- retries: { runMode: 2, openMode: 0 }

- defaultCommandTimeout / pageLoadTimeout tuned for CI.

Prefer stable selectors (text + class) over dynamic attributes.

## 📄 License

Educational/demo purposes. The OrangeHRM demo app is owned by its respective rights holders.

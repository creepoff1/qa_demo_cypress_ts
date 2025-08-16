#!/usr/bin/env bash
set -euo pipefail

echo "Running Cypress in ${BROWSER:-chromium}"
mkdir -p cypress/videos cypress/screenshots

npx cypress run \
  --browser "${BROWSER:-chromium}" \
  --spec "${SPECS:-cypress/e2e/**/*.cy.ts}" \
  --config video=true
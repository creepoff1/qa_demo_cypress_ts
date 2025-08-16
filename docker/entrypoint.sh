#!/usr/bin/env bash
set -euo pipefail

echo "Running Cypress in ${BROWSER:-chrome}"
mkdir -p cypress/videos cypress/screenshots

npx cypress run \
  --browser "${BROWSER:-chrome}" \
  --spec "${SPECS:-cypress/e2e/**/*.cy.ts}" \
  --config video=true
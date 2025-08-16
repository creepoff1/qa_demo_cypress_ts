FROM node:20-bookworm

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    xvfb \
    libgtk-3-0 libasound2 libnss3 libxss1 libgbm1 libatk1.0-0 libatk-bridge2.0-0 libdrm2 libxshmfence1 libx11-xcb1 \
    fonts-liberation xdg-utils ca-certificates curl wget \
    chromium \
 && rm -rf /var/lib/apt/lists/*

ENV CHROME_BIN=/usr/bin/chromium \
    CHROME_PATH=/usr/bin/chromium

ARG PROJECT_DIR=.
WORKDIR /e2e
COPY ${PROJECT_DIR}/package*.json ./
RUN npm ci || npm install
COPY ${PROJECT_DIR}/ ./

# Предзагрузим Cypress в образ (кэш бинарника)
RUN npx cypress install

# По умолчанию запускаем chrome и все спеки
ENV BROWSER=chrome \
    SPECS="cypress/e2e/**/*.cy.ts"

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

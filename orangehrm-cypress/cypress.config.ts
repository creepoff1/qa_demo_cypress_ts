import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        baseUrl: "https://opensource-demo.orangehrmlive.com",
        specPattern: "cypress/e2e/**/*.cy.ts",
        supportFile: "cypress/support/e2e.ts",
        video: true,                    // включим видео в CI
        screenshotOnRunFailure: true,
        viewportWidth: 1366,
        viewportHeight: 800,
        retries: process.env.CI ? { runMode: 2, openMode: 0 } : { runMode: 0, openMode: 0 },
        defaultCommandTimeout: process.env.CI ? 10000 : 6000,
        pageLoadTimeout: process.env.CI ? 60000 : 30000
    }
});
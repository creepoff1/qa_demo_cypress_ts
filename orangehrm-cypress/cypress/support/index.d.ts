/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
        /**
         * Log in via cy.session() — caches cookies across tests and specs.
         * Use this in beforeEach() instead of navigating through the UI every time.
         *
         * @example cy.login("Admin", "admin123")
         */
        login(username: string, password: string): Chainable<void>;

        /**
         * Convenience: logs in as Admin using credentials from fixtures/credentials.json.
         *
         * @example cy.loginAsAdmin()
         */
        loginAsAdmin(): Chainable<void>;
    }
}

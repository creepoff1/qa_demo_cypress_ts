import type { CredentialsFixture } from "../../src/types/fixtures";

/**
 * cy.login(username, password)
 *
 * Logs in via the UI and caches the session using cy.session().
 * Subsequent calls within the same run reuse the cached cookies —
 * no UI login is performed again unless the session expires.
 *
 * cacheAcrossSpecs: true → session is shared between all spec files in a run,
 * so login happens only ONCE per cypress run regardless of how many spec files need it.
 */
Cypress.Commands.add("login", (username: string, password: string) => {
    cy.session(
        [username, password],
        () => {
            cy.visit("/web/index.php/auth/login");
            cy.get('input[name="username"]').clear().type(username);
            cy.get('input[name="password"]').clear().type(password, { log: false });
            cy.contains("button.oxd-button", "Login").click();
            cy.url().should("include", "/dashboard");
        },
        {
            cacheAcrossSpecs: true,
            validate: () => {
                // Verify the cached session is still valid before reusing it.
                cy.request({
                    url: "/web/index.php/dashboard/index",
                    failOnStatusCode: false,
                }).its("status").should("eq", 200);
            },
        }
    );
});

/**
 * cy.loginAsAdmin()
 *
 * Shorthand: reads credentials from fixtures/credentials.json and calls cy.login().
 */
Cypress.Commands.add("loginAsAdmin", () => {
    cy.fixture<CredentialsFixture>("credentials.json").then(({ orangehrm }) => {
        cy.login(orangehrm.username, orangehrm.password);
    });
});

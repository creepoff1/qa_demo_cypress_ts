import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
    protected readonly path = "/web/index.php/dashboard/index";

    readonly selectors = {
        userDropdown: ".oxd-userdropdown-name",
    } as const;

    assertLoggedIn(): this {
        cy.url().should("include", "/dashboard");
        cy.title().should("contain", "OrangeHRM");
        return this;
    }

    assertWelcomeVisible(): this {
        cy.get(this.selectors.userDropdown).should("be.visible");
        return this;
    }

    getUserName(): Cypress.Chainable<string> {
        return cy.get(this.selectors.userDropdown).invoke("text");
    }
}

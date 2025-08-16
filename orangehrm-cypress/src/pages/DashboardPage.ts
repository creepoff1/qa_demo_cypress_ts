import { BasePage } from "./BasePage";

export class DashboardPage extends BasePage {
    protected path = "/web/index.php/dashboard/index";

    assertLoggedIn(): void {
        cy.url().should("include", "/dashboard");
        cy.title().should("contain", "OrangeHRM");
    }
}

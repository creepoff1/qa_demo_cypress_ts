import { BasePage } from "./BasePage";

export class ClaimAssignPage extends BasePage {
    protected path = "/web/index.php/claim/viewAssignClaim";

    open(): void {
        cy.visit(this.path);
    }

    assertLoaded(): void {
        cy.title().should("contain", "OrangeHRM");
        cy.contains("button.oxd-button", "Assign").should("be.visible");
    }
}
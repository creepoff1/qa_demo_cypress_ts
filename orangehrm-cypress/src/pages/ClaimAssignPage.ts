import { BasePage } from "./BasePage";

export class ClaimAssignPage extends BasePage {
    protected readonly path = "/web/index.php/claim/viewAssignClaim";

    readonly selectors = {
        assignButton: "button.oxd-button",
    } as const;

    assertLoaded(): this {
        cy.title().should("contain", "OrangeHRM");
        cy.contains(this.selectors.assignButton, "Assign").should("be.visible");
        return this;
    }
}

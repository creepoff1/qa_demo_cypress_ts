export class Sidebar {
    openClaimAssign(): void {
        cy.contains('[role="navigation"] a, [class*="oxd-main-menu"] a', /claim/i).click();
    }
}
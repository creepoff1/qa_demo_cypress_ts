export abstract class BasePage {
    protected abstract path: string;

    open(): void {
        cy.visit(this.path);
    }
    // assertOnOrangeHRM(): void {
    //     cy.location("origin").should("include", "opensource-demo.orangehrmlive.com");
    // }
}
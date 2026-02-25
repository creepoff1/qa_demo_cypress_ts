export abstract class BasePage {
    protected abstract readonly path: string;

    open(): this {
        cy.visit(this.path);
        return this;
    }
}

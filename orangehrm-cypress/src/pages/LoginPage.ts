import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
    protected path = "/web/index.php/auth/login";

    open(): void {
        cy.visit(this.path);
    }

    fillUsername(value: string): void {
        cy.get('input[name="username"]').clear().type(value);
    }

    fillPassword(value: string): void {
        cy.get('input[name="password"]').clear().type(value, { log: false });
    }

    submit(): void {
        cy.contains("button.oxd-button", "Login").click();
    }


    login(username: string, password: string): void {
        this.open();
        this.fillUsername(username);
        this.fillPassword(password);
        this.submit();
    }
}

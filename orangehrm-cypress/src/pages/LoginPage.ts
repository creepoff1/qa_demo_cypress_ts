import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
    protected readonly path = "/web/index.php/auth/login";

    readonly selectors = {
        usernameInput: 'input[name="username"]',
        passwordInput: 'input[name="password"]',
        loginButton:   "button.oxd-button",
    } as const;

    fillUsername(value: string): this {
        cy.get(this.selectors.usernameInput).clear().type(value);
        return this;
    }

    fillPassword(value: string): this {
        cy.get(this.selectors.passwordInput).clear().type(value, { log: false });
        return this;
    }

    submit(): this {
        cy.contains(this.selectors.loginButton, "Login").click();
        return this;
    }

    login(username: string, password: string): this {
        return this.open().fillUsername(username).fillPassword(password).submit();
    }

    assertErrorVisible(text: string | RegExp): this {
        cy.contains(text).should("be.visible");
        return this;
    }

    assertOnLoginPage(): this {
        cy.location("pathname").should("include", "/auth/login");
        return this;
    }
}

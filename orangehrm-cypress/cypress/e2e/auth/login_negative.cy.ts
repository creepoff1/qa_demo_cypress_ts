
import { LoginPage } from "../../../src/pages/LoginPage";

describe("Login - invalid credentials", () => {
    const login = new LoginPage();

    it("shows error on invalid password", () => {
        login.open();
        login.fillUsername("Admin");
        login.fillPassword("wrong-pass");
        login.submit();

        cy.contains(/Invalid credentials/).should("be.visible");
        cy.location("pathname").should("include", "/auth/login");
    });
});

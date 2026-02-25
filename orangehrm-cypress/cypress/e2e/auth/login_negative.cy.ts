import { LoginPage } from "../../../src/pages/LoginPage";

describe("Login — invalid credentials", () => {
    const loginPage = new LoginPage();

    beforeEach(() => {
        loginPage.open();
    });

    it("shows error on wrong password", () => {
        loginPage
            .fillUsername("Admin")
            .fillPassword("wrong-pass")
            .submit()
            .assertErrorVisible(/Invalid credentials/)
            .assertOnLoginPage();
    });

    it("shows validation error on empty fields", () => {
        loginPage
            .submit()
            .assertOnLoginPage();

        cy.contains(/Required/).should("be.visible");
    });
});

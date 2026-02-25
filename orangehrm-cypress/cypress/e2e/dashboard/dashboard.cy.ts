import { DashboardPage } from "../../../src/pages/DashboardPage";

describe("Dashboard", () => {
    const dashboard = new DashboardPage();

    beforeEach(() => {
        cy.loginAsAdmin();
        dashboard.open();
    });

    it("page title contains OrangeHRM", () => {
        cy.title().should("contain", "OrangeHRM");
    });

    it("URL includes /dashboard", () => {
        cy.url().should("include", "/dashboard");
    });

    it("shows logged-in user name in the topbar", () => {
        dashboard
            .assertWelcomeVisible()
            .getUserName()
            .should("not.be.empty");
    });
});

import { DashboardPage } from "../../../src/pages/DashboardPage";

describe("Login — valid credentials", () => {
    const dashboard = new DashboardPage();

    beforeEach(() => {
        cy.loginAsAdmin();
        dashboard.open();
    });

    it("redirects to dashboard after login", () => {
        dashboard.assertLoggedIn();
    });

    it("shows logged-in user name in the topbar", () => {
        dashboard
            .assertWelcomeVisible()
            .getUserName()
            .should("not.be.empty");
    });
});

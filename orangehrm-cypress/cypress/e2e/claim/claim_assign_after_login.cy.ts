import { LoginPage } from "../../../src/pages/LoginPage";
import { DashboardPage } from "../../../src/pages/DashboardPage";
import { ClaimAssignPage } from "../../../src/pages/ClaimAssignPage";

describe("Assign Claim — open after login (POM)", () => {
    const loginPage = new LoginPage();
    const dashboard = new DashboardPage();
    const claimAssign = new ClaimAssignPage();

    it("logs in and opens Assign Claim page", () => {
        cy.fixture("credentials.json").then(({ orangehrm }) => {

            loginPage.login(orangehrm.username, orangehrm.password);

            dashboard.assertLoggedIn();

            claimAssign.open();

            claimAssign.assertLoaded();

            cy.request("/web/index.php/claim/viewAssignClaim")
                .its("status")
                .should("eq", 200);
        });
    });
});

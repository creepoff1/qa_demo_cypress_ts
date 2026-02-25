import { DashboardPage } from "../../../src/pages/DashboardPage";
import { ClaimAssignPage } from "../../../src/pages/ClaimAssignPage";

describe("Assign Claim — open after login", () => {
    const dashboard = new DashboardPage();
    const claimAssign = new ClaimAssignPage();

    beforeEach(() => {
        cy.loginAsAdmin();
        dashboard.open().assertLoggedIn();
    });

    it("opens Assign Claim page directly", () => {
        claimAssign.open().assertLoaded();
    });

    it("Assign Claim API endpoint returns 200", () => {
        cy.request("/web/index.php/claim/viewAssignClaim")
            .its("status")
            .should("eq", 200);
    });
});

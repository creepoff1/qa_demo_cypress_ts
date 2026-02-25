import { DashboardPage } from "../../../src/pages/DashboardPage";
import { ClaimAssignPage } from "../../../src/pages/ClaimAssignPage";
import { Sidebar } from "../../../src/pages/Sidebar";

describe("Assign Claim — navigation via sidebar", () => {
    const dashboard = new DashboardPage();
    const claimAssign = new ClaimAssignPage();
    const sidebar = new Sidebar();

    beforeEach(() => {
        cy.loginAsAdmin();
        dashboard.open().assertLoggedIn();
    });

    it("navigates to Assign Claim via sidebar menu", () => {
        sidebar.openClaimAssign();
        claimAssign.assertLoaded();
    });
});

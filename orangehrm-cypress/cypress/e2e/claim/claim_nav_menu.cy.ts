import { LoginPage } from "../../../src/pages/LoginPage";
import { DashboardPage } from "../../../src/pages/DashboardPage";
import { ClaimAssignPage } from "../../../src/pages/ClaimAssignPage";
import { Sidebar } from "../../../src/pages/Sidebar";

describe("Assign Claim — navigation via menu", () => {
    const login = new LoginPage();
    const dashboard = new DashboardPage();
    const assign = new ClaimAssignPage();
    const sidebar = new Sidebar();

    it("opens Assign Claim from sidebar", () => {
        cy.fixture("credentials.json").then(({ orangehrm }) => {
            login.login(orangehrm.username, orangehrm.password);

            dashboard.assertLoggedIn();

            sidebar.openClaimAssign();

            assign.assertLoaded();
        });
    });
});
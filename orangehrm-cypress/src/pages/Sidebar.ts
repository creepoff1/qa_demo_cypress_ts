export class Sidebar {
    private readonly navSelector = '[role="navigation"] a, [class*="oxd-main-menu"] a';

    navigateTo(label: string | RegExp): this {
        cy.contains(this.navSelector, label).click();
        return this;
    }

    openClaimAssign(): this {
        return this.navigateTo(/claim/i);
    }

    openDashboard(): this {
        return this.navigateTo(/dashboard/i);
    }
}

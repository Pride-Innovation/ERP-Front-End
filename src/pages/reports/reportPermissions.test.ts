import { PERMISSIONS } from '../../core/permissions/constants';
import { REPORT_PAGE_PERMISSIONS, REPORT_TAB_PERMISSIONS } from './reportPermissions';

describe('reports page permissions', () => {
    it('gates Maintenance on the permission its endpoint demands', () => {
        // GET /assets/repairs answers to READ_REPAIR_HISTORY, matched before the /assets/** rule.
        expect(REPORT_TAB_PERMISSIONS.maintenance).toBe(PERMISSIONS.READ_REPAIR_HISTORY);
    });

    it('opens the page for anyone who can load at least one tab, and nobody else', () => {
        expect([...REPORT_PAGE_PERMISSIONS].sort()).toEqual([
            PERMISSIONS.READ_ASSET,
            PERMISSIONS.READ_INVENTORY,
            PERMISSIONS.READ_MOVEMENT,
            PERMISSIONS.READ_REPAIR_HISTORY,
            PERMISSIONS.READ_REQUEST,
        ].sort());
    });
});

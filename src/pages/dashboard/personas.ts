/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useMemo } from 'react';
import usePermissions from '../../core/permissions/usePermissions';
import { PERMISSIONS } from '../../core/permissions/constants';
import RoutesUtills from '../../core/routes/utills';
import { IUser } from '../users/interface';

/**
 * What the dashboard may show, derived from the signed-in user's effective permissions.
 *
 * Deliberately *not* a single "which dashboard am I" role name. A person holds one title but
 * many capabilities: a Branch Operations Manager who also approves requests is both a branch
 * lead and an approver, and should see both sets of widgets. Matching on `title.role.name`
 * cannot express that, and the previous implementation compared against title-shaped strings
 * ("Branch Manager") that no seeded role ever carried — so every non-super-admin fell through
 * to the personal dashboard.
 *
 * Granting or revoking a permission is therefore the only thing needed to change what a user
 * sees. No code change, no new role name.
 */
export interface IDashboardCapabilities {
    /** Sees every branch plus Head Office. Otherwise the page is pinned to `branchName`. */
    viewAllBranches: boolean;
    /** Approves or rejects requests — gets the approval queue and turnaround widgets. */
    approves: boolean;
    /** Runs a store: issues items, watches stock levels, reconciles counts. */
    fulfils: boolean;
    /** Reads the asset register (their branch's, or every branch's when `viewAllBranches`). */
    readsAssets: boolean;
    /** Reads stock/store data. */
    readsStore: boolean;
    /** Reads requests beyond their own. */
    readsRequests: boolean;
    /** Reads inventory (GRNs, orders). */
    readsInventory: boolean;
    /**
     * Sees their own assets and their own requests — the personal band.
     *
     * True for anyone signed in, and deliberately NOT gated on READ_ASSET: that permission
     * governs the branch-wide register, and requiring it to see the handful of items you are
     * personally accountable for would mean only administrators could check what they hold.
     * The endpoints behind this band derive identity from the token, so they cannot return
     * anyone else's records.
     */
    readsOwnRecords: boolean;
    /** The branch the page is scoped to when `viewAllBranches` is false. */
    branchName: string | null;
    /** Branch id for scoping data calls; null when unscoped or unknown. */
    branchId: number | null;
    /** First name for the greeting. */
    firstName: string;
}

/** The label shown in the hero, describing the reach of what's on screen. */
export const scopeLabel = (capabilities: IDashboardCapabilities): string => {
    if (capabilities.viewAllBranches) return 'All branches & Head Office';
    if (capabilities.branchName) return capabilities.branchName;
    return 'Your records';
};

const useDashboardCapabilities = (): IDashboardCapabilities => {
    const { has, hasAny } = usePermissions();
    const { getCurrentUser } = RoutesUtills();
    const user = getCurrentUser() as IUser;

    const branchId = typeof user?.branch?.id === 'number' ? user.branch.id : null;
    const branchName = user?.branch?.name ?? null;
    const firstName = user?.firstName ?? '';

    // `has`/`hasAny` are stable derivations of the same session user, so the identity of the
    // permission set is what matters here — recompute only when the underlying user changes.
    return useMemo(() => ({
        viewAllBranches: has(PERMISSIONS.VIEW_ALL_BRANCHES),
        approves: hasAny([PERMISSIONS.APPROVE_REQUEST, PERMISSIONS.REJECT_REQUEST]),
        fulfils: hasAny([PERMISSIONS.ISSUE_ITEMS, PERMISSIONS.APPROVE_ISSUANCE]),
        readsAssets: has(PERMISSIONS.READ_ASSET),
        readsStore: has(PERMISSIONS.READ_STORE),
        readsRequests: has(PERMISSIONS.READ_REQUEST),
        readsInventory: has(PERMISSIONS.READ_INVENTORY),
        readsOwnRecords: true,
        branchName,
        branchId,
        firstName,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [branchId, branchName, firstName]);
};

export default useDashboardCapabilities;

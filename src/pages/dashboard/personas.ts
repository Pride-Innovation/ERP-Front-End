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
 * What the dashboard may show, on two independent axes.
 *
 * <p><b>Subject</b> decides which widgets appear at all. <b>Scope</b> decides how far each one
 * reaches. They are separate because they answer separate questions, and the previous model
 * collapsed them into one: it read the route permissions (READ_ASSET and friends), which say
 * whether you may open a page, and used them to decide how much of the estate to summarise. So a
 * branch officer who needed READ_ASSET to open his own asset's detail page got a KPI band counting
 * the whole branch.
 *
 * <p>The axes are also why this is not a single "which dashboard am I" role name. One person holds
 * one title but many capabilities: a Branch Operations Manager who also approves requests is both a
 * branch lead and an approver, and should see both sets of widgets. And "Officer" is not one thing
 * — an officer in the Admin Unit legitimately needs cross-branch visibility that a branch officer
 * must never have. A role name cannot express either; role plus explicit scope can.
 */

/** How far the page may see. A ladder — the widest one held wins. */
export type DashboardScope = 'SELF' | 'BRANCH' | 'ALL';

const SCOPE_RANK: Record<DashboardScope, number> = { SELF: 0, BRANCH: 1, ALL: 2 };

export const scopeAtLeast = (scope: DashboardScope, minimum: DashboardScope): boolean =>
    SCOPE_RANK[scope] >= SCOPE_RANK[minimum];

export interface IDashboardCapabilities {
    // ── Subject: which widgets exist for this viewer ─────────────────────────
    /** Asset widgets: KPI band, Assets by Category, Asset Condition, branch heatmap. */
    viewsAssets: boolean;
    /** Request widgets: work queue, my requests, request fulfilment. */
    viewsRequests: boolean;
    /** Stock widgets: the stocking trend. */
    viewsStock: boolean;
    /** Movement widgets. */
    viewsMovements: boolean;

    // ── Scope: how far each of them reaches ──────────────────────────────────
    scope: DashboardScope;
    /** Convenience: the page offers a branch selector and can show a national roll-up. */
    viewAllBranches: boolean;

    /**
     * Their own assets and their own requests.
     *
     * True for anyone signed in, at every scope. The endpoints behind this band derive identity
     * from the token and cannot return anyone else's records, and requiring a permission to see the
     * handful of items you are personally accountable for would mean only administrators could
     * check what they hold.
     */
    readsOwnRecords: boolean;

    /** The branch the page is pinned to below ALL scope. */
    branchName: string | null;
    branchId: number | null;
    /** The unit (Admin / Infra) the viewer belongs to, where they have one. */
    unitName: string | null;
    firstName: string;
}

/** The label shown in the hero, describing the reach of what is on screen. */
export const scopeLabel = (capabilities: IDashboardCapabilities): string => {
    if (capabilities.scope === 'ALL') return 'All branches & Head Office';
    if (capabilities.branchName) return capabilities.branchName;
    // SELF, or a user with no duty station on record.
    return 'Your records';
};

const useDashboardCapabilities = (): IDashboardCapabilities => {
    const { has, hasAny } = usePermissions();
    const { getCurrentUser } = RoutesUtills();
    const user = getCurrentUser() as IUser;

    const branchId = typeof user?.branch?.id === 'number' ? user.branch.id : null;
    const branchName = user?.branch?.name ?? null;
    const unitName = (user?.unit && typeof user.unit === 'object' ? user.unit.name : null) ?? null;
    const firstName = user?.firstName ?? '';

    return useMemo(() => {
        /*
         * Migration without a blackout.
         *
         * Gating on the new permissions alone would empty every dashboard in the bank the moment
         * this ships, because no role holds them yet. So when a viewer holds none of an axis, that
         * axis falls back to the signals that governed them before. The rules here mirror
         * DashboardScopeService on the backend exactly — if they drifted, the page would render a
         * widget whose endpoint then refused it.
         */
        const anySubjectConfigured = hasAny([
            PERMISSIONS.DASH_VIEW_ASSETS,
            PERMISSIONS.DASH_VIEW_REQUESTS,
            PERMISSIONS.DASH_VIEW_STOCK,
            PERMISSIONS.DASH_VIEW_MOVEMENTS,
        ]);

        const subject = (dashPermission: string, legacyPermission: string): boolean => {
            if (has(dashPermission)) return true;
            return !anySubjectConfigured && has(legacyPermission);
        };

        const resolveScope = (): DashboardScope => {
            if (has(PERMISSIONS.DASH_SCOPE_ALL)) return 'ALL';
            if (has(PERMISSIONS.DASH_SCOPE_BRANCH)) return 'BRANCH';
            if (has(PERMISSIONS.DASH_SCOPE_SELF)) return 'SELF';

            // Legacy fallback, matching the backend.
            if (has(PERMISSIONS.VIEW_ALL_BRANCHES)) return 'ALL';
            const readsOrgData = hasAny([
                PERMISSIONS.READ_ASSET,
                PERMISSIONS.READ_REQUEST,
                PERMISSIONS.READ_STORE,
                PERMISSIONS.READ_INVENTORY,
            ]);
            return (readsOrgData && branchId !== null) ? 'BRANCH' : 'SELF';
        };

        const scope = resolveScope();

        return {
            viewsAssets: subject(PERMISSIONS.DASH_VIEW_ASSETS, PERMISSIONS.READ_ASSET),
            viewsRequests: subject(PERMISSIONS.DASH_VIEW_REQUESTS, PERMISSIONS.READ_REQUEST),
            viewsStock: subject(PERMISSIONS.DASH_VIEW_STOCK, PERMISSIONS.READ_STORE)
                || subject(PERMISSIONS.DASH_VIEW_STOCK, PERMISSIONS.READ_INVENTORY),
            viewsMovements: subject(PERMISSIONS.DASH_VIEW_MOVEMENTS, PERMISSIONS.READ_ASSET),
            scope,
            viewAllBranches: scope === 'ALL',
            readsOwnRecords: true,
            branchName,
            branchId,
            unitName,
            firstName,
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [branchId, branchName, unitName, firstName]);
};

export default useDashboardCapabilities;

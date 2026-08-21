/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../core/apis/axiosInstance";

/**
 * Per-category asset counts (total / assigned / unassigned / in maintenance), scoped server-side.
 *
 * `branchId` focuses the dashboard's branch selector and is only meaningful to a viewer whose scope
 * is ALL. Omitting it asks for that viewer's default: the national roll-up at ALL scope, their own
 * branch at BRANCH, their own records at SELF. Naming someone else's branch without ALL is refused
 * by the server rather than quietly rewritten.
 */
export const fetchBranchAssetStatisticsService = async (branchId?: number | null) => {
    try {
        return await axiosInstance.get('/assets/statistics', {
            params: branchId ? { branchId } : undefined,
        });
    } catch (error) {
        return error;
    }
};

/** Per-category asset totals across every branch. Unscoped — Head Office view only. */
export const fetchGlobalAssetReportService = async () => {
    try {
        return await axiosInstance.get('dashboard-asset-report');
    } catch (error) {
        return error;
    }
};

/**
 * The same totals split by branch — one row per branch/category pair. Feeds the heatmap.
 *
 * A separate route from the one above rather than a replacement: adding the branch dimension
 * multiplies the row count, so the flat per-category shape is still there for callers that want
 * a total. Guarded by VIEW_ALL_BRANCHES server-side, same as its unscoped sibling.
 */
export const fetchAssetsByBranchService = async () => {
    try {
        return await axiosInstance.get('dashboard-asset-report/by-branch');
    } catch (error) {
        return error;
    }
};

/** Last six months of stocking quantities, keyed by category. */
export const fetchMonthlyStockingReportService = async (branchId?: number | null) => {
    try {
        return await axiosInstance.get('monthly-asset-stock', {
            params: branchId ? { branchId } : undefined,
        });
    } catch (error) {
        return error;
    }
};

/** Requested vs delivered per category for the current year. */
export const fetchCurrentYearRequestSummaryService = async (branchId?: number | null) => {
    try {
        return await axiosInstance.get('/current-year-summary', {
            params: branchId ? { branchId } : undefined,
        });
    } catch (error) {
        return error;
    }
};

/** Monthly request volume over the trailing year. */
export const fetchRequestVolumeService = async () => {
    try {
        return await axiosInstance.get('/request-stats-one-year');
    } catch (error) {
        return error;
    }
};

/**
 * Requests waiting on the signed-in user's decision.
 *
 * <p>Replaces `/latest-pending-request` for the work queue. That endpoint answered a different
 * question: it filtered by status id and by a hardcoded switch on the user's role name, showing
 * Officers newly-created requests and everyone else approved ones, with no notion of who was
 * actually being waited on. This one is exactly what the workflow engine routed to this person, so
 * a request leaves the list the moment they act on it.
 */
export const fetchAwaitingMyDecisionService = async (pageSize = 25) => {
    try {
        return await axiosInstance.get('requests/awaiting-me', { params: { pageSize } });
    } catch (error) {
        return error;
    }
};

/**
 * Open requests within the viewer's scope — raised and not yet finished.
 *
 * <p>Open means every stage between raising and receipt: all approval tiers, the issuance, and the
 * movement carrying the item. A request drops off only when the requester acknowledges receiving it.
 */
export const fetchOpenRequestsService = async (pageSize = 25, branchId?: number | null) => {
    try {
        return await axiosInstance.get('requests/open', {
            params: { pageSize, ...(branchId ? { branchId } : {}) },
        });
    } catch (error) {
        return error;
    }
};

/** The signed-in user's own assets, grouped by category. */
export const fetchMyAssetsService = async () => {
    try {
        return await axiosInstance.get('/assets/my-assets');
    } catch (error) {
        return error;
    }
};

/** Movements waiting on a given approver. */
export const fetchMovementsAwaitingApprovalService = async (approverId: number | string) => {
    try {
        return await axiosInstance.get(`/movements/pending-approval/${approverId}`);
    } catch (error) {
        return error;
    }
};

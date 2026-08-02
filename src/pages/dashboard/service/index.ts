/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../core/apis/axiosInstance";

/**
 * Per-category asset counts for the caller's branch (total / assigned / unassigned / in maintenance).
 * Server-side this is currently pinned to the caller's own branch regardless of VIEW_ALL_BRANCHES —
 * see the note in useDashboardData about what that means for the Head Office view.
 */
export const fetchBranchAssetStatisticsService = async () => {
    try {
        return await axiosInstance.get('/assets/statistics');
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
export const fetchMonthlyStockingReportService = async () => {
    try {
        return await axiosInstance.get('monthly-asset-stock');
    } catch (error) {
        return error;
    }
};

/** Requested vs delivered per category for the current year. */
export const fetchCurrentYearRequestSummaryService = async () => {
    try {
        return await axiosInstance.get('/current-year-summary');
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

/** The open request queue. `pageSize` is deliberately caller-controlled — the work queue wants more than the default 3. */
export const fetchPendingRequestsService = async (pageSize = 25) => {
    try {
        return await axiosInstance.get(`/latest-pending-request?pageSize=${pageSize}`);
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

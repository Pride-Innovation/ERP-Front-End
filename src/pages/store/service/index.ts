/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../core/apis/axiosInstance";

const fetchStoreDetailsPerBranchService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`store/${id}`);
        return response;
    } catch (error) {
        return error;
    }
}

const fetchLastIssuedCommodityService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`last-issued/${id}`);
        return response;
    } catch (error) {
        return error;
    }
}

/** All consumable balances (with minLevel + lowStock), optionally filtered. */
const fetchBalancesService = async (params?: Record<string, any>) => {
    try {
        return await axiosInstance.get('inventory/balances', { params });
    } catch (error) {
        return error;
    }
}

/**
 * Every branch's stock position in one request. Replaces the previous approach of querying each
 * branch separately, which cost one round trip per branch on every load of the store landing page.
 */
const fetchBranchOverviewService = async () => {
    try {
        return await axiosInstance.get('inventory/branch-overview');
    } catch (error) {
        return error;
    }
}

/** Balances at or below their own reorder threshold. */
const fetchLowStockService = async () => {
    try {
        return await axiosInstance.get('inventory/low-stock');
    } catch (error) {
        return error;
    }
}

// ── Stock take ────────────────────────────────────────────────────────────
// The workflow is documented in the backend's docs/stock-take-api.md. Errors are allowed to
// propagate so callers can surface the server's message, which names the offending commodities.

const openStockCountService = async (body: Object) =>
    axiosInstance.post('stock-counts', body);

const fetchStockCountsService = async (storeId?: number) =>
    axiosInstance.get('stock-counts', { params: storeId ? { storeId } : {} });

const fetchStockCountService = async (countId: number | string) =>
    axiosInstance.get(`stock-counts/${countId}`);

/** Saves counted quantities. Safe to call repeatedly; only the lines sent are touched. */
const saveStockCountLinesService = async (countId: number | string, body: Object) =>
    axiosInstance.put(`stock-counts/${countId}/lines`, body);

const submitStockCountService = async (countId: number | string) =>
    axiosInstance.post(`stock-counts/${countId}/submit`);

const approveStockCountService = async (countId: number | string, remarks?: string) =>
    axiosInstance.post(`stock-counts/${countId}/approve`, { remarks: remarks ?? null });

const sendBackStockCountService = async (countId: number | string, remarks: string) =>
    axiosInstance.post(`stock-counts/${countId}/send-back`, { remarks });

/** The only call that changes stock. */
const postStockCountService = async (countId: number | string) =>
    axiosInstance.post(`stock-counts/${countId}/post`);

const cancelStockCountService = async (countId: number | string, remarks?: string) =>
    axiosInstance.post(`stock-counts/${countId}/cancel`, { remarks: remarks ?? null });

/** Adjustment history — what was corrected, by how much, and why. */
const fetchStockAdjustmentsService = async (params?: Record<string, any>) =>
    axiosInstance.get('stock-adjustments', { params });

/** Sets (or clears, with 0) a balance's reorder threshold. */
const setBalanceMinLevelService = async (balanceId: string | number, minLevel: number) => {
    try {
        return await axiosInstance.put(`inventory/balances/${balanceId}/min-level`, { minLevel });
    } catch (error) {
        return error;
    }
}

export {
    fetchStoreDetailsPerBranchService,
    fetchLastIssuedCommodityService,
    fetchBalancesService,
    fetchBranchOverviewService,
    fetchLowStockService,
    setBalanceMinLevelService,
    openStockCountService,
    fetchStockCountsService,
    fetchStockCountService,
    saveStockCountLinesService,
    submitStockCountService,
    approveStockCountService,
    sendBackStockCountService,
    postStockCountService,
    cancelStockCountService,
    fetchStockAdjustmentsService,
}
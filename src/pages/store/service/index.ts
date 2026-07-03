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

/** Balances at or below their own reorder threshold. */
const fetchLowStockService = async () => {
    try {
        return await axiosInstance.get('inventory/low-stock');
    } catch (error) {
        return error;
    }
}

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
    fetchLowStockService,
    setBalanceMinLevelService,
}
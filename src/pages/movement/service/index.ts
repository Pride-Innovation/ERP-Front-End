/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from '../../../core/apis/axiosInstance';
import {
    IMovementCreatePayload,
} from '../interface';
import { ReceiptStatus, StoreType } from '../constants';

const ENDPOINT = 'movements';

// ── Core movement lifecycle ────────────────────────────────────────────────

export const createMovementService = async (body: IMovementCreatePayload) => {
    try {
        return await axiosInstance.post(ENDPOINT, body);
    } catch (error) {
        return error;
    }
};

export const findMovementByIdService = async (id: string | number) => {
    try {
        return await axiosInstance.get(`${ENDPOINT}/${id}`);
    } catch (error) {
        return error;
    }
};

export const findMovementsByRequestService = async (requestId: string | number) => {
    try {
        return await axiosInstance.get(`${ENDPOINT}/by-request/${requestId}`);
    } catch (error) {
        return error;
    }
};

export const dispatchMovementService = async (
    id: string | number,
    body: {
        courierService?: string | null;
        trackingNumber?: string | null;
        dispatchDate?: string | null;
        expectedDeliveryDate?: string | null;
        deliveryDocuments?: string[];
    }
) => {
    try {
        return await axiosInstance.post(`${ENDPOINT}/${id}/dispatch`, body);
    } catch (error) {
        return error;
    }
};

export const markInTransitService = async (id: string | number) => {
    try {
        return await axiosInstance.post(`${ENDPOINT}/${id}/in-transit`);
    } catch (error) {
        return error;
    }
};

export const receiveMovementService = async (
    id: string | number,
    body?: { receiptStatus?: ReceiptStatus; remarks?: string | null }
) => {
    try {
        return await axiosInstance.post(`${ENDPOINT}/${id}/receive`, body ?? {});
    } catch (error) {
        return error;
    }
};

export const cancelMovementService = async (id: string | number, reason?: string) => {
    try {
        return await axiosInstance.post(`${ENDPOINT}/${id}/cancel`, { reason: reason ?? '' });
    } catch (error) {
        return error;
    }
};

export const completeMovementService = async (id: string | number, remarks?: string) => {
    try {
        return await axiosInstance.post(`${ENDPOINT}/${id}/complete`, { remarks: remarks ?? '' });
    } catch (error) {
        return error;
    }
};

export const approveMovementService = async (id: string | number, comment?: string) => {
    try {
        return await axiosInstance.post(`${ENDPOINT}/${id}/approve`, { comment: comment ?? '' });
    } catch (error) {
        return error;
    }
};

export const rejectMovementService = async (id: string | number, comment?: string) => {
    try {
        return await axiosInstance.post(`${ENDPOINT}/${id}/reject`, { comment: comment ?? '' });
    } catch (error) {
        return error;
    }
};

export const fetchMovementApprovalsService = async (id: string | number) => {
    try {
        return await axiosInstance.get(`${ENDPOINT}/${id}/approvals`);
    } catch (error) {
        return error;
    }
};

export const uploadMovementDocumentService = async (id: string | number, file: File) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        return await axiosInstance.post(`${ENDPOINT}/${id}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    } catch (error) {
        return error;
    }
};

// ── Repair / temp-replacement / return / disposal (§14-17) ─────────────────

export const repairTransferService = async (body: object) => {
    try {
        return await axiosInstance.post(`${ENDPOINT}/repair-transfer`, body);
    } catch (error) {
        return error;
    }
};

export const tempReplacementService = async (body: object) => {
    try {
        return await axiosInstance.post(`${ENDPOINT}/temp-replacement`, body);
    } catch (error) {
        return error;
    }
};

export const returnAfterRepairService = async (body: object) => {
    try {
        return await axiosInstance.post(`${ENDPOINT}/return-after-repair`, body);
    } catch (error) {
        return error;
    }
};

export const disposeAssetService = async (body: object) => {
    try {
        return await axiosInstance.post(`${ENDPOINT}/disposal`, body);
    } catch (error) {
        return error;
    }
};

// ── Inventory directory helpers (for the create / repair forms) ────────────

/** Store containers, optionally filtered by location / type / department. */
export const fetchStoresService = async (params?: {
    locationId?: number | string;
    storeType?: StoreType;
    departmentId?: number | string;
}) => {
    try {
        return await axiosInstance.get('inventory/stores', { params });
    } catch (error) {
        return error;
    }
};

/** Serialized assets currently held by a store. */
export const fetchStoreAssetsService = async (storeId: number | string) => {
    try {
        return await axiosInstance.get(`inventory/stores/${storeId}/assets`);
    } catch (error) {
        return error;
    }
};

/** Serialized assets held by any store of a given type across locations. */
export const fetchAssetsByStoreTypeService = async (storeType: StoreType) => {
    try {
        return await axiosInstance.get('inventory/assets', { params: { storeType } });
    } catch (error) {
        return error;
    }
};

/** Consumable balances, filtered by store / location / department / type. */
export const fetchStoreBalancesService = async (params?: {
    storeId?: number | string;
    locationId?: number | string;
    departmentId?: number | string;
    storeType?: StoreType;
}) => {
    try {
        return await axiosInstance.get('inventory/balances', { params });
    } catch (error) {
        return error;
    }
};

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from '../../../core/apis/axiosInstance';
import { IConsignmentCreatePayload, IConsignmentDispatchPayload } from '../interface';

const ENDPOINT = 'consignments';

export const createConsignmentService = async (body: IConsignmentCreatePayload) => {
    try {
        return await axiosInstance.post(ENDPOINT, body);
    } catch (error) {
        return error;
    }
};

/**
 * The consignments register, filtered by the server.
 *
 * <p>The parameter list was `status` and `branchId`, and the endpoint applied them in a ternary so
 * one silently discarded the other. `branchId` is gone: the scope is resolved from the caller's
 * permissions, not asked for — it used to be taken straight from the client, so a branch user could
 * read another branch's journeys by naming it.
 */
/**
 * Status totals for the current filters, over the whole matching set.
 *
 * <p>The tabs counted the rows the browser held, so past the fetch size they described a slice while
 * claiming to describe the register.
 */
export const fetchConsignmentStatusCountsService = async (params?: Record<string, any>) => {
    try {
        return await axiosInstance.get('consignments/status-counts', { params });
    } catch (error) {
        return error;
    }
};

/** The dropdown values, from the whole scoped register rather than the loaded page. */
export const fetchConsignmentFilterOptionsService = async () => {
    try {
        return await axiosInstance.get('consignments/filter-options');
    } catch (error) {
        return error;
    }
};

export const fetchConsignmentsService = async (params?: Record<string, any>) => {
    try {
        return await axiosInstance.get(ENDPOINT, { params });
    } catch (error) {
        return error;
    }
};

export const fetchConsignmentService = async (id: number | string) => {
    try {
        return await axiosInstance.get(`${ENDPOINT}/${id}`);
    } catch (error) {
        return error;
    }
};

/** Draft journeys already running this route, so a movement can join one instead of starting another. */
export const fetchOpenConsignmentsService = async (
    sourceLocationId: number | string,
    destLocationId: number | string
) => {
    try {
        return await axiosInstance.get(`${ENDPOINT}/open`, { params: { sourceLocationId, destLocationId } });
    } catch (error) {
        return error;
    }
};

// ── Assembly ───────────────────────────────────────────────────────────────

export const addMovementToConsignmentService = async (
    consignmentId: number | string,
    movementId: number | string
) => {
    try {
        return await axiosInstance.post(`${ENDPOINT}/${consignmentId}/movements/${movementId}`);
    } catch (error) {
        return error;
    }
};

export const removeMovementFromConsignmentService = async (
    consignmentId: number | string,
    movementId: number | string
) => {
    try {
        return await axiosInstance.delete(`${ENDPOINT}/${consignmentId}/movements/${movementId}`);
    } catch (error) {
        return error;
    }
};

// ── Journey ────────────────────────────────────────────────────────────────

export const dispatchConsignmentService = async (
    id: number | string,
    body: IConsignmentDispatchPayload
) => {
    try {
        return await axiosInstance.post(`${ENDPOINT}/${id}/dispatch`, body);
    } catch (error) {
        return error;
    }
};

export const markConsignmentInTransitService = async (id: number | string) => {
    try {
        return await axiosInstance.post(`${ENDPOINT}/${id}/in-transit`);
    } catch (error) {
        return error;
    }
};

export const markConsignmentArrivedService = async (id: number | string) => {
    try {
        return await axiosInstance.post(`${ENDPOINT}/${id}/arrive`);
    } catch (error) {
        return error;
    }
};

/**
 * Hands landed items to their recipients — several movements at once.
 *
 * <p>Only the movements named are received; anything left off stays outstanding, which is how a
 * branch handles someone who has not collected yet.
 */
export const receiveConsignmentService = async (
    id: number | string,
    body: {
        remarks?: string | null;
        movements: Array<{
            movementId: number;
            receiptStatus?: 'RECEIVED_OK' | 'RECEIVED_WITH_DISCREPANCY';
            remarks?: string | null;
        }>;
    }
) => {
    try {
        return await axiosInstance.post(`${ENDPOINT}/${id}/receive`, body);
    } catch (error) {
        return error;
    }
};

export const cancelConsignmentService = async (id: number | string, reason?: string) => {
    try {
        return await axiosInstance.post(`${ENDPOINT}/${id}/cancel`, { reason: reason ?? '' });
    } catch (error) {
        return error;
    }
};

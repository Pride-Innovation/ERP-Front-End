import axiosInstance from "../../../core/apis/axiosInstance";

const addStockService = async (body: Object) => {
    try {
        const response = await axiosInstance.post("stocks", body);
        return response;
    } catch (error) {
        return error;
    }
}

const fetchInventoryByIDService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`stocks/${id}`);
        return response;
    } catch (error) {
        return error;
    }
}

const uploadGRNService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`upload-grn/${id}`, body, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response;
    } catch (error) {
        return error;
    }
}

const completeDeliveryService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`stocks/${id}/complete-delivery`, body);
        return response;
    } catch (error) {
        return error;
    }
}

/**
 * Records one physical delivery against an order: every line that arrived in this batch, plus the
 * delivery-note details. The server turns it into one receipt, one GRN, one store credit and one
 * batch of assets — atomically. Quantities are deltas (what arrived now), not new totals.
 *
 * Errors are intentionally allowed to propagate so callers can distinguish a rejected receipt from
 * a successful one; the axios interceptor surfaces the message.
 */
const receiveDeliveryService = async (body: Object, id: string | number) => {
    return axiosInstance.post(`stocks/${id}/receipts`, body);
}

/** The delivery history of an order — one entry per physical receipt, oldest first. */
const fetchStockReceiptsService = async (id: string | number) => {
    return axiosInstance.get(`stocks/${id}/receipts`);
}

/**
 * Lines where the order, the GRN trail and the asset register disagree. Read-only: it reports
 * discrepancies, it does not repair them.
 */
const fetchStockReconciliationService = async (onlyDiscrepancies: boolean = true) => {
    return axiosInstance.get(`stock-reconciliation`, { params: { onlyDiscrepancies } });
}

/**
 * Corrects an existing stock's header + commodity lines in place (PUT /stocks/{id}).
 * This is the "fix a mistake" path — distinct from complete-delivery, which records new
 * deliveries. Used by the Update page.
 */
const updateStockService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.put(`stocks/${id}`, body);
        return response;
    } catch (error) {
        return error;
    }
}

/**
 * Closes a partially-delivered stock short — the outstanding quantity is accepted as never
 * arriving, moving the record from "Pending" to the terminal "Closed Short" state.
 */
const closeShortService = async (id: string | number, reason: string) => {
    return axiosInstance.post(`stocks/${id}/close-short`, { reason });
}

const fetchGrnCommoditiesByStockIDService = async (id: string | number) => {
    try {
        // An explicit size is required: the endpoint is paginated and defaults to 20, so an order
        // received in several batches silently lost GRN lines off the end of the printed note.
        const response = await axiosInstance.get(`grn-commodities/${id}`, { params: { size: 500 } });
        return response;
    } catch (error) {
        return error;
    }
}

const deleteInventoryService = async (id: number | string) => {
    try {
        const response = await axiosInstance.post(`delete-stock/${id}`);
        return response;
    } catch (error) {
        return error;
    }
}

const downloadGoodsReceivedNote = async (id: string | number) => {
    try {
        const response = await axiosInstance.put(`download-grn/${id}`);
        return response;
    } catch (error) {
        return error;
    }
}

/**
 * Fetches an uploaded (signed) GRN document as a blob through the authenticated API,
 * rather than referencing a world-readable /statics path. Callers turn the blob into
 * an object URL for preview/download and revoke it when done.
 */
const fetchGrnDocumentService = async (grnReportId: string | number) => {
    return axiosInstance.get(`grn-reports/${grnReportId}/document`, {
        responseType: 'blob',
    });
}


export {
    addStockService,
    fetchInventoryByIDService,
    uploadGRNService,
    completeDeliveryService,
    receiveDeliveryService,
    fetchStockReceiptsService,
    fetchStockReconciliationService,
    updateStockService,
    closeShortService,
    fetchGrnCommoditiesByStockIDService,
    deleteInventoryService,
    downloadGoodsReceivedNote,
    fetchGrnDocumentService
}
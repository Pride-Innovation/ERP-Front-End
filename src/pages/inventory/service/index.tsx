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
        const response = await axiosInstance.get(`grn-commodities/${id}`);
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
    updateStockService,
    closeShortService,
    fetchGrnCommoditiesByStockIDService,
    deleteInventoryService,
    downloadGoodsReceivedNote,
    fetchGrnDocumentService
}
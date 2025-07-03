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

const fetchGrnCommoditiesByStockIDService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`grn-commodities/${id}`);
        return response;
    } catch (error) {
        return error;
    }
}

export {
    addStockService,
    fetchInventoryByIDService,
    uploadGRNService,
    completeDeliveryService,
    fetchGrnCommoditiesByStockIDService
}
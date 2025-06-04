import axiosInstance from "../../../core/apis/axiosInstance";

const addStockService = async (body: Object) => {
    try {
        const response = await axiosInstance.post("stocks", body);
        return response;
    } catch (error) {
        return error;
    }
}

export {
    addStockService
}
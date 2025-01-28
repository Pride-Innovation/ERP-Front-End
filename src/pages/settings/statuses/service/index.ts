import axiosInstance from "../../../../core/apis/axiosInstance";

const listAssetStatusesService = async () => {
    try {
        const response = await axiosInstance.get('assetStatuses');
        return response.data?.data;
    } catch (error) {
        throw error;
    }
}

const createStatusService = async (body: Object) => {
    try {
        const response = await axiosInstance.post('assetStatuses/create', body);
        return response?.data
    } catch (error) {
        throw error
    }
}

const updateStatusService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`assetStatuses/update/${id}`, body)
        return response?.data
    } catch (error) {
        throw error
    }
}

export {
    listAssetStatusesService,
    createStatusService,
    updateStatusService
}
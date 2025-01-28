import axiosInstance from "../../../../core/apis/axiosInstance";

const listAssetStatusesService = async () => {
    try {
        const response = await axiosInstance.get('assetStatuses');
        return response.data?.data;
    } catch (error) {
        throw error;
    }
}

export {
    listAssetStatusesService,
}
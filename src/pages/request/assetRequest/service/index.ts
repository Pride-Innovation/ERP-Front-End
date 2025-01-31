import axiosInstance from "../../../../core/apis/axiosInstance"

const createAssetRequestService = async (object: Object) => {
    try {
        const response = await axiosInstance.post("assetRequisitions/create", object);
        return response?.data
    } catch (error) {
        throw (error)
    }
}

const updateAssetRequestService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`assetRequisitions/update/${id}`, body, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response?.data
    } catch (error) {
        throw (error)
    }
}

export {
    createAssetRequestService,
    updateAssetRequestService
}
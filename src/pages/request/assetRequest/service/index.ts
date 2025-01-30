import axiosInstance from "../../../../core/apis/axiosInstance"

const createAssetRequestService = async (object: Object) => {
    try {
        const response = await axiosInstance.post("assetRequisitions/create", object);
        return response?.data
    } catch (error) {
        throw (error)
    }
}

export {
    createAssetRequestService
}
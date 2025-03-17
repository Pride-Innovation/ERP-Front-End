import axiosInstance from "../../../../core/apis/axiosInstance"

const createAssetRequestService = async (object: Object) => {
    try {
        const response = await axiosInstance.post("/requests", object);
        console.log(response.data, "response data!!")
        return response?.data
    } catch (error) {
        throw (error)
    }
}

const updateAssetRequestService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`assetRequisitions/update/${id}`, body);
        return response?.data
    } catch (error) {
        throw (error)
    }
}

const deleteAssetRequestService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`assetRequisitions/delete/${id}`);
        return response?.data
    } catch (error) {
        throw (error)
    }
}


const findAssetRequestByIDService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`assetRequisitions/${id}`);
        return response?.data
    } catch (error) {
        throw (error)
    }
}

export {
    createAssetRequestService,
    updateAssetRequestService,
    deleteAssetRequestService,
    findAssetRequestByIDService
}
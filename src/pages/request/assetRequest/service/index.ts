import axiosInstance from "../../../../core/apis/axiosInstance"

const createAssetRequestService = async (object: Object) => {
    try {
        const response = await axiosInstance.post("/requests", object, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response?.data
    } catch (error) {
        console.log(error)
    }
}

const updateAssetRequestService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.put(`/requests/${id}`, body, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response?.data
    } catch (error) {
        throw (error)
    }
}

const deleteAssetRequestService = async (id: string | number) => {
    try {
        const response = await axiosInstance.delete(`/requests/${id}`);
        return response?.data
    } catch (error) {
        throw (error)
    }
}


const findAssetRequestByIDService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`/requests/${id}`);
        return response?.data
    } catch (error) {
        console.log(error)
    }
}

export {
    createAssetRequestService,
    updateAssetRequestService,
    deleteAssetRequestService,
    findAssetRequestByIDService
}
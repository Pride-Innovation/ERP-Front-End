import axiosInstance from "../../../../core/apis/axiosInstance"

const createBranchService = async (body: Object) => {
    try {
        const response = await axiosInstance.post('branches/create', body);
        return response?.data
    } catch (error) {
        throw error
    }
}

const updateBranchService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`branches/update/${id}`, body)
        return response?.data
    } catch (error) {
        throw error
    }
}

const deleteBranchService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`branches/delete/${id}`)
        return response?.data
    } catch (error) {
        throw error
    }
}


export {
    createBranchService,
    updateBranchService,
    deleteBranchService
}
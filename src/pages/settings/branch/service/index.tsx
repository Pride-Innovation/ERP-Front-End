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
        const response = await axiosInstance.post(`branch/${id}`, body)
        console.log(response?.data)
    } catch (error) {
        throw error
    }
}


export {
    createBranchService,
    updateBranchService
}
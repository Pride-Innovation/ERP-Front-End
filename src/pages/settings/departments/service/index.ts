import axiosInstance from "../../../../core/apis/axiosInstance";

const listDepartmentsService = async () => {
    try {
        const response = await axiosInstance.get("departments");
        return response.data?.data
    } catch (error) {
        throw error;
    }
}

export {
    listDepartmentsService
}
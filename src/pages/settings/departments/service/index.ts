import axiosInstance from "../../../../core/apis/axiosInstance";

const listDepartmentsService = async () => {
    try {
        const response = await axiosInstance.get("departments");
        return response.data?.data
    } catch (error) {
        throw error;
    }
}

const createDepartmentService = async (body: Object) => {
    try {
        const response = await axiosInstance.post('departments/create', body);
        return response.data
    } catch (error) {
        throw error;
    }
}

const updateDepartmentService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`departments/update/${id}`, body);
        return response.data
    } catch (error) {
        throw error;
    }
}

export {
    listDepartmentsService,
    updateDepartmentService,
    createDepartmentService
}
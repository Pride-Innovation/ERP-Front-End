import axiosInstance from "../../../../core/apis/axiosInstance"

const fetchITEquipmentService = async () => {
    try {
        const response = await axiosInstance.get("itAssets");
        return response.data?.data
    } catch (error) {
        throw error;
    }
}

const createITEquipmentService = async (body: object) => {
    try {
        const response = await axiosInstance.post("itAssets/create", body);
        return response.data?.data
    } catch (error) {
        // throw error;
        console.log(error)
    }
}


const deleteITEquipmentService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`itAssets/delete/${id}`);
        return response.data?.data
    } catch (error) {
        // throw error;
        console.log(error)
    }
}


export {
    fetchITEquipmentService,
    createITEquipmentService,
    deleteITEquipmentService
}
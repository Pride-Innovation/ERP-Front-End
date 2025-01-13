import axiosInstance from "../../../../core/apis/axiosInstance"

const fetchOfficeEquipmentService = async () => {
    try {
        const response = await axiosInstance.get("officeEquipmentAssets");
        return response.data?.data
    } catch (error) {
        throw error;
    }
}

const createOfficeEquipmentService = async (body: object) => {
    try {
        const response = await axiosInstance.post("officeEquipmentAssets/create", body)
        return response.data
    } catch (error) {
        throw error;
    }
}

export {
    fetchOfficeEquipmentService,
    createOfficeEquipmentService
}
import axiosInstance from "../../../../core/apis/axiosInstance"

export const fetchOfficeEquipmentService = async () => {
    try {
        const response = await axiosInstance.get("officeEquipmentAssets");
        return response.data?.data
    } catch (error) {
        throw error;
    }
}
import axiosInstance from "../../../../core/apis/axiosInstance"

export const fetchITEquipmentService = async () => {
    try {
        const response = await axiosInstance.get("officeEquipmentAssets/");
        return response.data?.data["0"]?.data
    } catch (error) {
        throw error;
    }
}
import axiosInstance from "../../../../core/apis/axiosInstance"

export const fetchITEquipmentService = async () => {
    try {
        const response = await axiosInstance.get("itAssets");
        return response.data?.data
    } catch (error) {
        throw error;
    }
}
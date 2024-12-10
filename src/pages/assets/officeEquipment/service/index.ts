import axiosInstance from "../../../../core/apis/axiosInstance"

export const fetchOfficeEquipmentService = async () => {
    try {
        const response = await axiosInstance.get("itAssetCategories");
        return response.data?.data["0"]?.data
    } catch (error) {
        throw error;
    }
}
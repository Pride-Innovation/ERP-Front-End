import axiosInstance from "../../../../core/apis/axiosInstance"

export const fetchFleetService = async () => {
    try {
        const response = await axiosInstance.get("fleetAssets/");
        return response.data?.data["0"]?.data
    } catch (error) {
        throw error;
    }
}
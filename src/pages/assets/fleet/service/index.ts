import axiosInstance from "../../../../core/apis/axiosInstance"

export const fetchFleetService = async () => {
    try {
        const response = await axiosInstance.get("fleetAssets");
        console.log(response, "response!!")
        return response.data?.data
    } catch (error) {
        throw error;
    }
}
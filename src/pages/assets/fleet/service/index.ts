import axiosInstance from "../../../../core/apis/axiosInstance"

export const fetchFleetService = async () => {
    try {
        const response = await axiosInstance.get("fleetAssets");
        return response.data?.data
    } catch (error) {
        throw error;
    }
}

export const createFleetService = async (body: Object) => {
    try {
        const response = await axiosInstance.post("fleetAssets/create", body);
        return response.data
    } catch (error) {
        throw error;
    }
}

export const getFleetEquipmentByIDService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`fleetAssets/${id}`);
        return response?.data?.data
    } catch (error) {
        throw error;
    }
}
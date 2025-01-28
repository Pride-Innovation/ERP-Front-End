import axiosInstance from "../../../../core/apis/axiosInstance";

const fetchAllTransportRequestService = async () => {
    try {
        const response = await axiosInstance.get("fleetRequisitions");
        return response?.data?.data
    } catch (error) {
        throw (error)
    }
}

export {
    fetchAllTransportRequestService
}
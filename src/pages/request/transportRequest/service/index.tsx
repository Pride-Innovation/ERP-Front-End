import axiosInstance from "../../../../core/apis/axiosInstance";

const fetchAllTransportRequestService = async () => {
    try {
        const response = await axiosInstance.get("fleetRequisitions");
        return response?.data?.data
    } catch (error) {
        throw (error)
    }
}

const createTranportRequestService = async (body: Object) => {
    try {
        const response = await axiosInstance.post("fleetRequisitions/create", body);
        return response?.data?.data
    } catch (error) {
        throw (error)
    }
}


const findTranportRequestByIDService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`fleetRequisitions/${id}`);
        return response?.data?.data
    } catch (error) {
        throw (error)
    }
}

const updateTranportRequestService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`fleetRequisitions/update/${id}`, body);
        return response?.data
    } catch (error) {
        throw (error)
    }
}

const deleteTranportRequestService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`fleetRequisitions/delete/${id}`);
        return response?.data
    } catch (error) {
        throw (error)
    }
}

export {
    fetchAllTransportRequestService,
    createTranportRequestService,
    findTranportRequestByIDService,
    updateTranportRequestService,
    deleteTranportRequestService
}
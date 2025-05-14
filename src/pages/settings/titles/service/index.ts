import axiosInstance from "../../../../core/apis/axiosInstance"

const createTitleService = async (body: Object) => {
    try {
        const response = await axiosInstance.post("titles", body);
        return response;
    } catch (error) {
        return error
    }
}

export {
    createTitleService
}
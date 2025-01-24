import axiosInstance from "../../../../core/apis/axiosInstance";

const createUnitMeasureService = async (body: Object) => {
    try {
        const response = await axiosInstance.post('unitMeasures/create', body);
        return response?.data
    } catch (error) {
        throw error
    }
}

const updateUnitMeasureService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`unitMeasures/update/${id}`, body)
        return response?.data
    } catch (error) {
        throw error
    }
}

export {
    createUnitMeasureService,
    updateUnitMeasureService
}
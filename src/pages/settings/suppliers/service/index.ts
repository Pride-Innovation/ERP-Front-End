import axiosInstance from "../../../../core/apis/axiosInstance";

const listSuppliersService = async () => {
    try {
        const response = await axiosInstance.get('suppliers');
        return response.data?.data;
    } catch (error) {
        throw error;
    }
}

const createSupplierService = async (body: Object) => {
    try {
        const response = await axiosInstance.post('suppliers/create', body);
        return response?.data
    } catch (error) {
        throw error
    }
}

const updateSupplierService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`suppliers/update/${id}`, body)
        return response?.data
    } catch (error) {
        throw error
    }
}

const deleteSupplierService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`suppliers/delete/${id}`)
        return response?.data
    } catch (error) {
        throw error
    }
}

export {
    listSuppliersService,
    createSupplierService,
    updateSupplierService,
    deleteSupplierService
}
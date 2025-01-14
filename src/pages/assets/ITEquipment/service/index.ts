import axiosInstance from "../../../../core/apis/axiosInstance"

const fetchITEquipmentService = async () => {
    try {
        const response = await axiosInstance.get("itAssets");
        return response.data?.data
    } catch (error) {
        throw error;
    }
}

const createITEquipmentService = async (body: object) => {
    try {
        const response = await axiosInstance.post("itAssets/create", body);
        return response.data?.data
    } catch (error) {
        // throw error;
        console.log(error)
    }
}


const deleteITEquipmentService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`itAssets/delete/${id}`);
        return response.data?.data
    } catch (error) {
        // throw error;
        console.log(error)
    }
}

const getITEquipmentByIDService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`itAssets/${id}`);
        return response.data?.data
    } catch (error) {
        console.log(error)
    }
}

const updateITEquipmentService = async (body: object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`itAssets/update/${id}`, body);
        return response?.data;
    } catch (error) {
        console.log(error)
    }
}

const listBranchesService = async () => {
    try {
        const response = await axiosInstance.get('branches');
        return response.data?.data;
    } catch (error) {
        throw error;
    }
}

const listUsersService = async () => {
    try {
        const response = await axiosInstance.get('users');
        return response.data?.data;
    } catch (error) {
        throw error;
    }
}

const listCategoriesService = async () => {
    try {
        const response = await axiosInstance.get('itAssetCategories');
        return response.data?.data;
    } catch (error) {
        throw error;
    }
}

const listUnitOfMeasuresService = async () => {
    try {
        const response = await axiosInstance.get('unitMeasures');
        return response.data?.data;
    } catch (error) {
        throw error;
    }
}

const listAssetStatusesService = async () => {
    try {
        const response = await axiosInstance.get('assetStatuses');
        return response.data?.data;
    } catch (error) {
        throw error;
    }
}

export {
    fetchITEquipmentService,
    createITEquipmentService,
    deleteITEquipmentService,
    getITEquipmentByIDService,
    updateITEquipmentService,
    listBranchesService,
    listUsersService,
    listCategoriesService,
    listUnitOfMeasuresService,
    listAssetStatusesService
}
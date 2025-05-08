/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance"

const fetchITEquipmentService = async () => {
    try {
        const response = await axiosInstance.get("itAssets");
        return response.data?.data
    } catch (error) {
        return error;
    }
}

const createITEquipmentService = async (body: object) => {
    try {
        const response = await axiosInstance.post("itAssets/create", body);
        return response.data
    } catch (error) {
        return error;
    }
}


const deleteITEquipmentService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`itAssets/delete/${id}`);
        return response.data?.data
    } catch (error) {
        return error;
    }
}

const getITEquipmentByIDService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`itAssets/${id}`);
        return response.data?.data
    } catch (error) {
        return error;
    }
}

const updateITEquipmentService = async (body: object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`itAssets/update/${id}`, body);
        return response?.data;
    } catch (error) {
        return error;
    }
}

const listUsersService = async () => {
    try {
        const response = await axiosInstance.get('users');
        return response.data?.data;
    } catch (error) {
        return error;
    }
}

const listCategoriesService = async () => {
    try {
        const response = await axiosInstance.get('itAssetCategories');
        return response.data?.data;
    } catch (error) {
        return error;
    }
}

const listUnitOfMeasuresService = async () => {
    try {
        const response = await axiosInstance.get('unitMeasures');
        return response.data?.data;
    } catch (error) {
        return error;
    }
}



export {
    fetchITEquipmentService,
    createITEquipmentService,
    deleteITEquipmentService,
    getITEquipmentByIDService,
    updateITEquipmentService,
    listUsersService,
    listCategoriesService,
    listUnitOfMeasuresService,
}
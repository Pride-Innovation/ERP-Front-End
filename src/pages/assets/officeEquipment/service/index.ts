/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance"


const createOfficeEquipmentService = async (body: object) => {
    try {
        const response = await axiosInstance.post("assets", body);
        return response
    } catch (error) {
        return error;
    }
}

const deleteOfficeEquipmentService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`officeEquipmentAssets/delete/${id}`);
        return response
    } catch (error) {
        return error
    }
}

const getOfficeEquipmentByIDService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`assets/${id}`);
        return response
    } catch (error) {
        return error;
    }
}

const updateOfficeEquipmentService = async (body: object, id: string | number) => {
    try {
        const response = await axiosInstance.put(`assets/${id}`, body);
        return response
    } catch (error) {
        return error
    }
}

const listRepairDetailService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`assets/repairs/${id}`);
        return response
    } catch (error) {
        return error
    }
}

const disposeOfficeEquipmentService = async (id: string | number) => {
    try {
        const response = await axiosInstance.post(`assets/${id}`);
        return response;
    } catch (error) {
        return error;
    }
}

const updateOfficeEquipmentImageService = async (id: string | number, body: object) => {
    try {
        const response = await axiosInstance.put(`assets/image/${id}`, body, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response;
    } catch (error) {
        return error;
    }
}

const removeOfficeEquipmentImageService = async (id: string | number) => {
    try {
        const response = await axiosInstance.put(`assets/remove/image/${id}`);
        return response;
    } catch (error) {
        return error;
    }
}

export {
    createOfficeEquipmentService,
    deleteOfficeEquipmentService,
    getOfficeEquipmentByIDService,
    updateOfficeEquipmentService,
    listRepairDetailService,
    disposeOfficeEquipmentService,
    updateOfficeEquipmentImageService,
    removeOfficeEquipmentImageService
}
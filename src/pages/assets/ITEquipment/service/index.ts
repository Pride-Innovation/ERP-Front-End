/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance"

const createITEquipmentService = async (body: object) => {
    try {
        const response = await axiosInstance.post("assets", body);
        return response
    } catch (error) {
        return error;
    }
}


const deleteITEquipmentService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`itAssets/delete/${id}`);
        return response
    } catch (error) {
        return error;
    }
}

const getITEquipmentByIDService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`assets/${id}`);
        return response
    } catch (error) {
        return error;
    }
}

const updateITEquipmentService = async (body: object, id: string | number) => {
    try {
        const response = await axiosInstance.put(`assets/${id}`, body);
        return response;
    } catch (error) {
        return error;
    }
}

const disposeITEquipmentService = async (id: string | number) => {
    try {
        const response = await axiosInstance.post(`assets/${id}`);
        return response;
    } catch (error) {
        return error;
    }
}

const reassignITEquipmentService = async (id: string | number, body: object) => {
    try {
        const response = await axiosInstance.post(`assets/reassign/${id}`, body);
        return response;
    } catch (error) {
        return error;
    }
}

export {
    createITEquipmentService,
    deleteITEquipmentService,
    getITEquipmentByIDService,
    updateITEquipmentService,
    disposeITEquipmentService,
    reassignITEquipmentService
}
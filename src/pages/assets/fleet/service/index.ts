/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance"

export const createFleetService = async (body: Object) => {
    try {
        const response = await axiosInstance.post("assets", body);
        return response
    } catch (error) {
        return error;
    }
}

export const getFleetEquipmentByIDService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`assets/${id}`);
        return response
    } catch (error) {
        return error;
    }
}

export const updateFleetEquipmentService = async (body: object, id: string | number) => {
    try {
        const response = await axiosInstance.put(`assets/${id}`, body);
        return response
    } catch (error) {
        return error
    }
}

export const bulkInsertFleetService = async (data: object) => {
    try {
        const response = await axiosInstance.post(`assets/bulk-insert`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        return error;
    }
}

export const disposeFleetService = async (id: string | number) => {
    try {
        const response = await axiosInstance.post(`assets/${id}`);
        return response;
    } catch (error) {
        return error;
    }
}

export const reassignFleetService = async (id: string | number, body: object) => {
    try {
        const response = await axiosInstance.post(`assets/reassign/${id}`, body);
        return response;
    } catch (error) {
        return error;
    }
}

export const getFleetByIDService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`assets/${id}`);
        return response
    } catch (error) {
        return error;
    }
}

export const updateFleetImageService = async (id: string | number, body: object) => {
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

export const removeFleetImageService = async (id: string | number) => {
    try {
        const response = await axiosInstance.put(`assets/remove/image/${id}`);
        return response;
    } catch (error) {
        return error;
    }
}
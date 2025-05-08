/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance"

export const fetchFleetService = async () => {
    try {
        const response = await axiosInstance.get("fleetAssets");
        return response.data?.data
    } catch (error) {
        throw error;
    }
}

export const createFleetService = async (body: Object) => {
    try {
        const response = await axiosInstance.post("fleetAssets/create", body);
        return response.data
    } catch (error) {
        throw error;
    }
}

export const getFleetEquipmentByIDService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`fleetAssets/${id}`);
        return response?.data?.data
    } catch (error) {
        throw error;
    }
}

export const updateFleetEquipmentService = async (body: object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`fleetAssets/update/${id}`, body);
        return response?.data
    } catch (error) {
        throw error
    }
}
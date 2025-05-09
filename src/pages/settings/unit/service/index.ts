/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance";

const listUnitsService = async () => {
    try {
        const response = await axiosInstance.get('units');
        return response.data?.data;
    } catch (error) {
        throw error;
    }
}

const createUnitService = async (body: Object) => {
    try {
        const response = await axiosInstance.post('units/create', body);
        return response.data
    } catch (error) {
        throw error;
    }
}

const updateUnitService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`units/update/${id}`, body);
        return response.data;
    } catch (error) {
        throw error;
    }
}


const deleteUnitService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`units/delete/${id}`)
        return response.data;
    } catch (error) {
        throw error;
    }
}

export {
    listUnitsService,
    createUnitService,
    updateUnitService,
    deleteUnitService
}
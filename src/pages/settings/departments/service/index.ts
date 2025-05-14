/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance";

const createDepartmentService = async (body: Object) => {
    try {
        const response = await axiosInstance.post('departments/create', body);
        return response.data
    } catch (error) {
        throw error;
    }
}

const updateDepartmentService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`departments/update/${id}`, body);
        return response.data
    } catch (error) {
        throw error;
    }
}

const deleteDepartmentService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`departments/delete/${id}`);
        return response.data
    } catch (error) {
        throw error;
    }
}

export {
    updateDepartmentService,
    createDepartmentService,
    deleteDepartmentService
}
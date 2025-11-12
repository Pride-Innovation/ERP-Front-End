/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance";

const createDepartmentService = async (body: Object) => {
    try {
        const response = await axiosInstance.post('departments', body);
        return response
    } catch (error) {
        return error;
    }
}

const updateDepartmentService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.put(`departments/${id}`, body);
        return response.data
    } catch (error) {
        return error;
    }
}

const deleteDepartmentService = async (id: string | number) => {
    try {
        const response = await axiosInstance.delete(`departments/${id}`);
        return response.data
    } catch (error) {
        return error;
    }
}

export {
    updateDepartmentService,
    createDepartmentService,
    deleteDepartmentService
}
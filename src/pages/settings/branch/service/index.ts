/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance"

const listBranchesService = async () => {
    try {
        const response = await axiosInstance.get('branches');
        return response;
    } catch (error) {
        return error;
    }
}

const createBranchService = async (body: Object) => {
    try {
        const response = await axiosInstance.post('branches/create', body);
        return response?.data
    } catch (error) {
        return error
    }
}

const updateBranchService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`branches/update/${id}`, body)
        return response?.data
    } catch (error) {
        return error
    }
}

const deleteBranchService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`branches/delete/${id}`)
        return response?.data
    } catch (error) {
        return error
    }
}


export {
    listBranchesService,
    createBranchService,
    updateBranchService,
    deleteBranchService
}
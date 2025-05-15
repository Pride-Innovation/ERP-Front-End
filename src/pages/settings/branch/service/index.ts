/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance"

const createBranchService = async (body: Object) => {
    try {
        const response = await axiosInstance.post('branches', body);
        return response
    } catch (error) {
        return error
    }
}

const updateBranchService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.put(`branches/${id}`, body)
        return response
    } catch (error) {
        return error
    }
}

const deleteBranchService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`branches/delete/${id}`)
        return response
    } catch (error) {
        return error
    }
}


export {
    createBranchService,
    updateBranchService,
    deleteBranchService
}
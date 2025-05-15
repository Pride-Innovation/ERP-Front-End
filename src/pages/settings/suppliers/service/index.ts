/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance";

const createSupplierService = async (body: Object) => {
    try {
        const response = await axiosInstance.post('suppliers', body);
        return response
    } catch (error) {
        return error
    }
}

const updateSupplierService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.put(`suppliers/${id}`, body)
        return response
    } catch (error) {
        return error
    }
}

const deleteSupplierService = async (id: string | number) => {
    try {
        const response = await axiosInstance.delete(`suppliers/${id}`)
        return response
    } catch (error) {
        return error
    }
}

export {
    createSupplierService,
    updateSupplierService,
    deleteSupplierService
}
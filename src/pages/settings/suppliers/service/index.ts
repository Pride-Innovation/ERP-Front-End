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
        throw error
    }
}

const updateSupplierService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`suppliers/${id}`, body)
        return response
    } catch (error) {
        throw error
    }
}

const deleteSupplierService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`suppliers/${id}`)
        return response
    } catch (error) {
        throw error
    }
}

export {
    createSupplierService,
    updateSupplierService,
    deleteSupplierService
}
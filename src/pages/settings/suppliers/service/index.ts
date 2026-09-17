/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance";

/**
 * A paginated page of suppliers, searchable by name.
 *
 * <p>Unscoped on purpose: suppliers are organisation-wide. A branch does not own its suppliers the
 * way it owns its staff, so unlike the user directory there is nothing here to narrow by branch.
 */
const fetchSuppliersService = async (params?: Record<string, any>) => {
    try {
        return await axiosInstance.get('suppliers', { params });
    } catch (error) {
        return error;
    }
};

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
    fetchSuppliersService,
    createSupplierService,
    updateSupplierService,
    deleteSupplierService
}
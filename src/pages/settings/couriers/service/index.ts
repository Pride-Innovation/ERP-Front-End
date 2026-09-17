/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance";

/** Plain (non-paginated) list; pass activeOnly=true for pickers that must exclude retired couriers. */
const fetchCouriersService = async (activeOnly = false) => {
    try {
        return await axiosInstance.get('couriers', { params: { activeOnly } });
    } catch (error) {
        return error;
    }
};

const createCourierService = async (body: Object) => {
    try {
        return await axiosInstance.post('couriers', body);
    } catch (error) {
        return error;
    }
};

const updateCourierService = async (body: Object, id: string | number) => {
    try {
        return await axiosInstance.put(`couriers/${id}`, body);
    } catch (error) {
        return error;
    }
};

const deleteCourierService = async (id: string | number) => {
    try {
        return await axiosInstance.delete(`couriers/${id}`);
    } catch (error) {
        return error;
    }
};

export {
    fetchCouriersService,
    createCourierService,
    updateCourierService,
    deleteCourierService,
};

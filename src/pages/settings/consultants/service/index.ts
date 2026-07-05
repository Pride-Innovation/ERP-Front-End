/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance";

/** Plain (non-paginated) list; pass activeOnly=true for pickers that must exclude retired vendors. */
const fetchConsultantsService = async (activeOnly = false) => {
    try {
        return await axiosInstance.get('consultants', { params: { activeOnly } });
    } catch (error) {
        return error;
    }
};

const createConsultantService = async (body: Object) => {
    try {
        return await axiosInstance.post('consultants', body);
    } catch (error) {
        return error;
    }
};

const updateConsultantService = async (body: Object, id: string | number) => {
    try {
        return await axiosInstance.put(`consultants/${id}`, body);
    } catch (error) {
        return error;
    }
};

const deleteConsultantService = async (id: string | number) => {
    try {
        return await axiosInstance.delete(`consultants/${id}`);
    } catch (error) {
        return error;
    }
};

export {
    fetchConsultantsService,
    createConsultantService,
    updateConsultantService,
    deleteConsultantService,
};

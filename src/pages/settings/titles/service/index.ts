/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance"

const createTitleService = async (body: Object) => {
    try {
        const response = await axiosInstance.post("titles", body);
        return response;
    } catch (error) {
        return error
    }
}

const updateTitleService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.put(`titles/${id}`, body);
        return response;
    } catch (error) {
        return error;
    }
}

export {
    createTitleService,
    updateTitleService
}
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance";

const listAssetStatusesService = async () => {
    try {
        const response = await axiosInstance.get('/statuses');
        return response.data;
    } catch (error) {
        return error;
    }
}

const createStatusService = async (body: Object) => {
    try {
        const response = await axiosInstance.post('assetStatuses/create', body);
        return response?.data
    } catch (error) {
        return error
    }
}

const updateStatusService = async (body: Object, id: number) => {
    try {
        const response = await axiosInstance.post(`assetStatuses/update/${id}`, body)
        return response?.data
    } catch (error) {
        return error
    }
}

const deleteStatusService = async (id: number) => {
    try {
        const response = await axiosInstance.get(`assetStatuses/delete/${id}`)
        return response?.data
    } catch (error) {
        return error
    }
}

export {
    listAssetStatusesService,
    createStatusService,
    updateStatusService,
    deleteStatusService
}
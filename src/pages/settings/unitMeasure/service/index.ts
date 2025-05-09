/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance";

const createUnitMeasureService = async (body: Object) => {
    try {
        const response = await axiosInstance.post('unitMeasures/create', body);
        return response?.data
    } catch (error) {
        throw error
    }
}

const updateUnitMeasureService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.post(`unitMeasures/update/${id}`, body)
        return response?.data
    } catch (error) {
        throw error
    }
}

const deleteUnitMeasureService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`unitMeasures/delete/${id}`)
        return response?.data
    } catch (error) {
        throw error
    }
}

export {
    createUnitMeasureService,
    updateUnitMeasureService,
    deleteUnitMeasureService
}
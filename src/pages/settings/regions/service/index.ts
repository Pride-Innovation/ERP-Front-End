/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance";
import { IRegion } from "../interface";

const endPoint = "regions";

export const createRegionService = async (body: Object) => {
    try {
        const response = await axiosInstance.post(endPoint, body);
        return response
    } catch (error) {
        return error
    }
}

export const updateRegionService = async (data: IRegion, id: string) => {
    try {
        const response = await axiosInstance.put(`${endPoint}/${id}`, data);
        return response
    } catch (error) {
        return error
    }
};

export const deleteRegionService = async (id: string) => {
    // return await deleteRowService({ endPoint, id });
    try {
        const response = await axiosInstance.delete(`${endPoint}/${id}`);
        return response
    } catch (error) {
        return error
    }
};
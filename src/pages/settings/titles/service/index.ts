/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance"
import { TitleOccupancyConflict } from "../classification"

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

const deleteTitleService = async (id: string | number) => {
    try {
        const response = await axiosInstance.delete(`titles/${id}`);
        return response;
    } catch (error) {
        return error;
    }
}

/**
 * Locations where a single-holder title has more than one active holder. Throws on failure (unlike
 * the services above), so a refusal cannot be mistaken for "no conflicts".
 */
const fetchTitleOccupancyConflicts = async (): Promise<TitleOccupancyConflict[]> => {
    const { data } = await axiosInstance.get<TitleOccupancyConflict[]>("titles/occupancy-conflicts");
    return Array.isArray(data) ? data : [];
}

export {
    fetchTitleOccupancyConflicts,
    createTitleService,
    updateTitleService,
    deleteTitleService
}
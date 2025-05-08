/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "./axiosInstance";
import { IFetchRowsService } from "./interface"

export const fetchRowsService = async ({
    pageNumber,
    pageSize, 
    endPoint }: IFetchRowsService) => {
    try {
        const response = await axiosInstance.get(`${endPoint}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
        return response;
    } catch (error) {
        return (error);
    }
}

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "./axiosInstance";
import { IFetchRowsService } from "./interface";

/**
 * Fetch paginated rows from a given endpoint with dynamic query parameters.
 *
 * @param pageNumber - The page number to fetch.
 * @param pageSize - Number of records per page.
 * @param endPoint - API endpoint to hit.
 * @param params - Optional query parameters (e.g., filters like first_name, email, etc.).
 */
export const fetchRowsService = async ({
    pageNumber,
    pageSize,
    endPoint,
    params = {}
}: IFetchRowsService & { params?: Record<string, any> }) => {
    try {
        const searchParams = new URLSearchParams();

        // Always include pageNumber and pageSize
        searchParams.append("pageNumber", (pageNumber as number).toString());
        searchParams.append("pageSize", (pageSize as number).toString());

        // Append only truthy primitive values (skip objects to avoid "[object Object]")
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '' && typeof value !== 'object') {
                searchParams.append(key, value.toString());
            }
        });

        const response = await axiosInstance.get(`${endPoint}?${searchParams.toString()}`);
        return response;
    } catch (error) {
        return error;
    }
};


export const fetchAllRowsService = async ({ endPoint, params = {} }
    : { endPoint: string } & { params?: Record<string, any> }) => {
    const searchParams = new URLSearchParams();

    // Append only truthy values
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value.toString());
        }
    });

    try {
        const response = await axiosInstance.get(`export/${endPoint}`, { params: searchParams });
        return response.data;
    } catch (error) {
        return error;
    }
};
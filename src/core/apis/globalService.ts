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


/**
 * The server's own explanation for refusing a call, or `fallback` when it did not give one.
 *
 * <p>Every service here answers `catch (error) { return error }`, so a 4xx arrives as an AxiosError
 * with the body one level deeper at `response.data` — reading `res.data.message` off one of those
 * finds nothing and silently swaps a precise refusal ("leaves from a different location than this
 * consignment") for a generic one. Spring's `ProblemDetail` puts the text in `detail`; the older
 * handlers in this codebase use `message`; both shapes are read, at both depths.
 */
export const refusal = (res: any, fallback: string): string =>
    res?.response?.data?.detail
    ?? res?.response?.data?.message
    ?? res?.data?.detail
    ?? res?.data?.message
    ?? fallback;

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
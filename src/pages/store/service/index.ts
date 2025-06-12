/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../core/apis/axiosInstance";

const fetchStoreDetailsPerBranchService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`store/${id}`);
        return response;
    } catch (error) {
        return error;
    }
}

const fetchLastIssuedCommodityService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`last-issued/${id}`);
        return response;
    } catch (error) {
        return error;
    }
}

export {
    fetchStoreDetailsPerBranchService,
    fetchLastIssuedCommodityService
}
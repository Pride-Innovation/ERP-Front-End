/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance";

const createCommodityService = async (body: Object) => {
    try {
        const response = await axiosInstance.post("commodities", body);
        return response;
    } catch (error) {
        return error;
    }
};

export {
    createCommodityService
}
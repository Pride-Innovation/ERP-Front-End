/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../../core/apis/axiosInstance"

const createAssetRequestService = async (object: Object) => {
    try {
        const response = await axiosInstance.post("/requests", object, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response
    } catch (error) {
        return error
    }
}

const updateAssetRequestService = async (body: Object, id: string | number) => {
    try {
        const response = await axiosInstance.put(`/requests/${id}`, body, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response
    } catch (error) {
        return (error)
    }
}

const deleteAssetRequestService = async (id: string | number) => {
    try {
        const response = await axiosInstance.delete(`/requests/${id}`);
        return response
    } catch (error) {
        throw (error)
    }
}


const findAssetRequestByIDService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`/requests/${id}`);
        return response
    } catch (error) {
        return error;
    }
}

const assetRequestApprovalRejectionService = async (body: Object) => {
    try {
        const response = await axiosInstance.post("approvals", body);
        return response;
    } catch (error) {
        return error;
    }
}

export {
    createAssetRequestService,
    updateAssetRequestService,
    deleteAssetRequestService,
    findAssetRequestByIDService,
    assetRequestApprovalRejectionService
}
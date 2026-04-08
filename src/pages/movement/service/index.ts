/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from '../../../core/apis/axiosInstance';

const ENDPOINT = 'movements';

export const createMovementService = async (body: object) => {
    try {
        const response = await axiosInstance.post(ENDPOINT, body);
        return response;
    } catch (error) {
        return error;
    }
};

export const updateMovementService = async (body: object, id: string | number) => {
    try {
        const response = await axiosInstance.put(`${ENDPOINT}/${id}`, body);
        return response;
    } catch (error) {
        return error;
    }
};

export const deleteMovementService = async (id: string | number) => {
    try {
        const response = await axiosInstance.delete(`${ENDPOINT}/${id}`);
        return response;
    } catch (error) {
        return error;
    }
};

export const findMovementByIdService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`${ENDPOINT}/${id}`);
        return response;
    } catch (error) {
        return error;
    }
};

export const submitMovementForApprovalService = async (id: string | number) => {
    try {
        const response = await axiosInstance.post(`${ENDPOINT}/${id}/submit`);
        return response;
    } catch (error) {
        return error;
    }
};

export const approveMovementService = async (body: object) => {
    try {
        const response = await axiosInstance.post(`${ENDPOINT}/approve`, body);
        return response;
    } catch (error) {
        return error;
    }
};

export const rejectMovementService = async (body: object) => {
    try {
        const response = await axiosInstance.post(`${ENDPOINT}/reject`, body);
        return response;
    } catch (error) {
        return error;
    }
};

export const releaseMovementService = async (body: object) => {
    try {
        const response = await axiosInstance.post(`${ENDPOINT}/release`, body);
        return response;
    } catch (error) {
        return error;
    }
};

export const receiveMovementService = async (body: object) => {
    try {
        const response = await axiosInstance.post(`${ENDPOINT}/receive`, body);
        return response;
    } catch (error) {
        return error;
    }
};

export const downloadSecurityPassService = async (id: string | number) => {
    try {
        const response = await axiosInstance.get(`${ENDPOINT}/${id}/security-pass`, {
            responseType: 'blob',
        });
        return response;
    } catch (error) {
        return error;
    }
};

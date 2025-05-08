/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../core/apis/axiosInstance";
import { IAuthentication } from "../interface";

export const loginService = async (body: IAuthentication) => {
    try {
        const response = await axiosInstance.post("", body);
        console.log(response?.data, "response!!")
    } catch (error) {
        console.log(error, "response error!!")
    }
}

export const requestPasswordResetService = async (body: IAuthentication) => {
    try {
        const response = await axiosInstance.post("", body);
        console.log(response?.data, "response!!");
    } catch (error) {
        console.log(error, "response error!!")
    }
}

export const resetPasswordService = async (body: IAuthentication) => {
    try {
        const response = await axiosInstance.post("", body);
        console.log(response?.data, "response!!");
    } catch (error) {
        console.log(error, "response error!!")
    }
}
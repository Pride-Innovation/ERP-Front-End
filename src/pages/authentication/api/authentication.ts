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
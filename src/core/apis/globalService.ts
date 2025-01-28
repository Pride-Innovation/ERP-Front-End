import axiosInstance from "./axiosInstance";
import { IFetchRowsService } from "./interface"

export const fetchRowsService = async ({
    page,
    // size, 
    endPoint }: IFetchRowsService) => {
    try {
        // const response = await axiosInstance.get(`${endPoint}?page=${page}&_limit=${size}`);
        const response = await axiosInstance.get(`${endPoint}?page=${page}`);
        return response.data;
    } catch (error) {
        throw (error);
    }
}

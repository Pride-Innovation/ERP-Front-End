import axiosInstance from "./axiosInstance";
import { IFetchRowsService } from "./interface"

export const fetchRowsService = async ({ page, size, endPoint }: IFetchRowsService) => {
    try {
        const response = await axiosInstance.get(`${endPoint}?_page=${page}&_limit=${size}`);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}

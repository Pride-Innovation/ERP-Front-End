import axiosInstance from "./axiosInstance";
import { IFetchRowsService } from "./interface"

export const fetchRowsService = async ({
    pageNumber,
    pageSize, 
    endPoint }: IFetchRowsService) => {
    try {
        const response = await axiosInstance.get(`${endPoint}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
        return response.data;
    } catch (error) {
        return (error);
    }
}

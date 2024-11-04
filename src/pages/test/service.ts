import axiosInstance from "../../core/apis/axiosInstance";

export const fetchTestData = async ({ id, size }: { id: number, size: number }) => {
    try {
        const response = await axiosInstance.get(`posts?_page=${id}&_limit=${size}`);
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.log(error, "error!!!")
    }
}
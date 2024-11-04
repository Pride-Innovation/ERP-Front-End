
import axios, { AxiosResponse, AxiosError } from 'axios';

interface ErrorResponse {
    message?: string;
}

export const ErrorMessage = 'Something went wrong!';
const unknownError = 'An unknown error occurred';
const { BASE_URL } = process.env;

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
});

axiosInstance.interceptors.request.use(
    (config: any) => {
        if (!config.headers) {
            config.headers = {};
        }

        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            config.headers['Accept'] = 'application/json';

        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        const errorMessage =
            (error.response?.data as ErrorResponse)?.message ||
            error.message ||
            unknownError;
        return Promise.reject(new Error(errorMessage));
    }
);

export default axiosInstance;
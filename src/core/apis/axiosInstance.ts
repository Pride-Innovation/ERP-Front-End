
import axios, { AxiosResponse, AxiosError } from 'axios';
import RoutesUtills from '../routes/utills';

interface ErrorResponse {
    message?: string;
}

export const ErrorMessage = 'Something went wrong!';
const unknownError = 'An unknown error occurred';
const { accessToken } = RoutesUtills();
const { REACT_APP_BASE_URL } = process.env

const axiosInstance = axios.create({
    baseURL: `${REACT_APP_BASE_URL}/api/`,
    timeout: 60000,
});

axiosInstance.interceptors.request.use(
    (config: any) => {
        if (!config.headers) {
            config.headers = {};
        }

        const token = sessionStorage.getItem(accessToken);
        
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
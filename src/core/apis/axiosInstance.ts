
import axios, { AxiosResponse, AxiosError } from 'axios';
import RoutesUtills from '../routes/utills';
import { toast } from 'react-toastify';
import { ROUTES } from '../routes/routes';

interface ErrorResponse {
    message?: string;
    detail?: string;
    error?: string;
}

export const ErrorMessage = 'Something went wrong!';
const unknownError = 'An unknown error occurred';

const { accessToken, refreshToken } = RoutesUtills();
const { REACT_APP_BASE_URL } = process.env

const axiosInstance = axios.create({
    baseURL: `${REACT_APP_BASE_URL}`,
    timeout: 60000,
});

async function refreshAccessToken() {
    const storedRefreshToken = sessionStorage.getItem(refreshToken);

    if (!storedRefreshToken) {
        return null;
    }

    try {
        const response = await axios.post(
            `${REACT_APP_BASE_URL}${ROUTES.REFRESH_TOKEN}`,
            { refresh: storedRefreshToken }
        );
        const newAccessToken = response.data.access;

        sessionStorage.setItem(accessToken, newAccessToken);

        return newAccessToken;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
}

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
    async (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            const originalRequest = error.config;

            const newAccessToken = await refreshAccessToken();

            if (newAccessToken && originalRequest) {
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axios(originalRequest);
            }

            sessionStorage.removeItem(accessToken);
            sessionStorage.removeItem(refreshToken);

            const errorMessage =
                (error.response?.data as ErrorResponse)?.message ||
                (error.response?.data as ErrorResponse)?.detail ||
                (error.response?.data as ErrorResponse)?.error ||
                error.message ||
                unknownError;

            toast.error(errorMessage)
            return Promise.reject(new Error(errorMessage));
        }

        const errorMessage =
            (error.response?.data as ErrorResponse)?.message ||
            (error.response?.data as ErrorResponse)?.detail ||
            (error.response?.data as ErrorResponse)?.error ||
            error.message ||
            unknownError;

        toast.error(errorMessage)
        return Promise.reject(new Error(errorMessage));
    }
);

export default axiosInstance;
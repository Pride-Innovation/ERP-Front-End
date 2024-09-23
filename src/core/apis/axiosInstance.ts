import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { ROUTES } from "../routes/routes";

const status = (response: AxiosResponse): Promise<AxiosResponse> => {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
    }
    return Promise.reject(response);
}

export const service = (() => {
    const api = axios.create({
        baseURL: 'http://localhost:8080/api',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        withCredentials: true
    });

    const onRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = sessionStorage.getItem('jwtToken');

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    }

    const onRequestError = (error: any): Promise<any> => {
        return Promise.reject(error);
    }

    const onResponse = (response: AxiosResponse): Promise<AxiosResponse> => {
        return status(response);
    }

    const onResponseError = async (error: any): Promise<any> => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = sessionStorage.getItem('refreshToken');

                const response = await api.post(ROUTES.REFRESH_TOKEN, { token: refreshToken }, { withCredentials: true });

                const newToken = response.data.token;

                sessionStorage.setItem('jwtToken', newToken);

                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                return api(originalRequest);

            } catch (refreshError) {
                console.error('Error during token refresh:', refreshError);
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }

    api.interceptors.request.use(onRequest, onRequestError);
    api.interceptors.response.use(onResponse, onResponseError);

    return api;
})();

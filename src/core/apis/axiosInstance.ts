/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';

export const ErrorMessage = 'Something went wrong!';

// Session storage keys — kept in sync with RoutesUtills.ts
const ACCESS_TOKEN_KEY  = 'access-token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const CURRENT_USER_KEY  = 'current-user';

const { REACT_APP_BASE_URL } = process.env;

const axiosInstance = axios.create({
    baseURL: REACT_APP_BASE_URL,
    timeout: 60000,
});

// ── Token-refresh queue ────────────────────────────────────────────────────
// While a refresh is in flight, subsequent 401 requests are held here.
// They are replayed (or rejected) once the refresh settles.
type QueueEntry = {
    resolve: (value: AxiosResponse | PromiseLike<AxiosResponse>) => void;
    reject:  (reason?: unknown) => void;
    config:  InternalAxiosRequestConfig & { _retry?: boolean };
};

let isRefreshing  = false;
let pendingQueue: QueueEntry[] = [];

function drainQueue(error: unknown, newToken: string | null): void {
    const drained = pendingQueue.splice(0);
    drained.forEach(({ resolve, reject, config }) => {
        if (newToken) {
            config.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(axiosInstance(config));
        } else {
            reject(error);
        }
    });
}

// Calls the backend refresh endpoint.
// The backend expects the refresh token as a Bearer token in the
// Authorization header and returns a full AuthenticationResponse.
async function doRefresh(): Promise<string | null> {
    const storedRefresh = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefresh) return null;

    try {
        const { data } = await axios.post<{
            accessToken:  string;
            refreshToken: string;
            id?:          number;
            firstName?:   string;
            lastName?:    string;
            email?:       string;
            gender?:      string;
        }>(
            `${REACT_APP_BASE_URL}/auth/refresh-token`,
            {},
            { headers: { Authorization: `Bearer ${storedRefresh}` } }
        );

        sessionStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
        sessionStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);

        // Keep cached user profile in sync with the refreshed identity.
        if (data.id) {
            const prev = JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY) || '{}');
            sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...prev, ...data }));
        }

        return data.accessToken;
    } catch {
        return null;
    }
}

function clearSession(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
}

// ── Request interceptor: attach access token ───────────────────────────────
axiosInstance.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            config.headers['Accept'] = 'application/json';
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// ── Response interceptor: transparent token refresh on 401 ────────────────
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const original = error.config as
            | (InternalAxiosRequestConfig & { _retry?: boolean })
            | undefined;

        // Only attempt refresh once per request, and only for 401 errors.
        if (error.response?.status === 401 && original && !original._retry) {
            if (isRefreshing) {
                // Park this request; it will be retried after the in-flight refresh.
                return new Promise<AxiosResponse>((resolve, reject) => {
                    pendingQueue.push({ resolve, reject, config: original });
                });
            }

            original._retry = true;
            isRefreshing    = true;

            const newToken = await doRefresh();
            isRefreshing   = false;

            if (newToken) {
                drainQueue(null, newToken);
                original.headers['Authorization'] = `Bearer ${newToken}`;
                return axiosInstance(original);
            }

            // Refresh failed — session is unrecoverable.
            drainQueue(new Error('Session expired'), null);
            clearSession();
            toast.info('Your session has expired. Please log in again.');
            window.location.href = '/';
            return Promise.reject(new Error('Session expired'));
        }

        const data = error.response?.data as
            | { message?: string; detail?: string; error?: string }
            | undefined;
        const message =
            data?.message ?? data?.detail ?? data?.error ??
            error.message ?? 'An unknown error occurred';

        toast.error(message);
        return Promise.reject(new Error(message));
    }
);

export default axiosInstance;

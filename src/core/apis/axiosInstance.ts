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
            | { message?: string; detail?: string; error?: string; errorCode?: string }
            | string
            | undefined;
        // The backend returns some errors as a plain string body (e.g. business-rule
        // violations) and others as an object — handle both so the real message shows.
        const serverMessage =
            typeof data === 'string'
                ? (data.trim() || undefined)
                : (data?.message ?? data?.detail ?? data?.error);
        const message = serverMessage ?? error.message ?? 'An unknown error occurred';
        const errorCode = typeof data === 'string' ? undefined : data?.errorCode;

        /*
         * A body carrying `errorCode` is claimed by whoever made the call: the code exists precisely
         * so one specific case can be recognised and presented properly — the movement pages' "no
         * approver, proceed anyway?" dialog, the login page's blocked / locked / disabled branches.
         * Toasting here too would pre-empt that dialog with a bare error and stack two messages on
         * screen. Everything without a code is unclaimed, and still reported here.
         */
        if (!errorCode) {
            toast.error(message);
        }

        /*
         * Rejected as the original AxiosError, so `response.data` — and with it `errorCode` —
         * survives the trip.
         *
         * <p>This used to reject `new Error(message)`, which flattened every failure to a bare
         * string. Services here answer `catch (error) { return error }`, so callers received an
         * object with no `response` and no `data`: every test for a code silently failed and took
         * its fallback path instead. That is why `noApproverError` never once returned non-null and
         * the NoApproverDialog could not open, and why a blocked login reported bad credentials.
         *
         * <p>`message` is overwritten rather than left as axios's "Request failed with status code
         * 400" so the callers that only read `error.message` keep showing the same server text they
         * always did.
         */
        error.message = message;
        return Promise.reject(error);
    }
);

export default axiosInstance;

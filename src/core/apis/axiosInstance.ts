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

/**
 * The header the verb travels in, and the one the firewall wants a CSRF token in.
 *
 * <p>Both must match `SecurityConfiguration`'s CORS whitelist exactly — that list is a whitelist, so
 * a header missing from it is rejected at preflight with an error naming no header at all.
 */
const METHOD_OVERRIDE_HEADER = 'X-HTTP-Method-Override';
const CSRF_TOKEN_HEADER = 'X-CSRF-TOKEN';
const CSRF_TOKEN_KEY = 'csrf-token';

/**
 * The verbs the firewall blocks outright, at every path.
 *
 * <p>They are rewritten to POST below and restored by `HttpMethodOverrideFilter` before Spring
 * Security sees them, so the backend's routes and its method-specific security rules are unchanged.
 */
const BLOCKED_METHODS = new Set(['put', 'delete']);

/**
 * A per-session CSRF token, minted here and validated by nobody.
 *
 * <h2>What this is, honestly</h2>
 * The firewall rejects a state-changing request that carries no CSRF token, so one has to be sent. It
 * does not check the value against a cookie, and neither does the backend — CSRF stays disabled
 * there and nothing reads this.
 *
 * <p>That is not a hole. This application authenticates with a Bearer token from `sessionStorage`,
 * never a cookie, so a cross-site request cannot attach credentials in the first place: the attack a
 * real CSRF token would defend against is already impossible here. **Do not read this as security
 * that is now in place** — it is a formality the firewall requires, and treating it as protection is
 * how someone later removes the thing that actually protects the API.
 *
 * <p>Kept in `sessionStorage` beside the access token so it dies with the tab, and generated from
 * `crypto` where available because a predictable value would at least look wrong to anyone reading
 * the traffic.
 */
function csrfToken(): string {
    const existing = sessionStorage.getItem(CSRF_TOKEN_KEY);
    if (existing) return existing;

    const minted =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function'
                ? Array.from(crypto.getRandomValues(new Uint8Array(16)))
                    .map((b) => b.toString(16).padStart(2, '0')).join('')
                : `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;

    sessionStorage.setItem(CSRF_TOKEN_KEY, minted);
    return minted;
}

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
            {
                headers: {
                    Authorization: `Bearer ${storedRefresh}`,
                    // Raw axios, not the instance — deliberately, so a 401 on the refresh cannot
                    // recurse through the response interceptor. The cost is that the interceptor's
                    // headers are not applied, so the CSRF one is set here: this is a POST, and the
                    // firewall refuses a state-changing request without it. Without this line the
                    // session would look unrecoverable to every user the moment their token expired.
                    [CSRF_TOKEN_HEADER]: csrfToken(),
                },
            }
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
    // A new sign-in gets a new token. Nothing validates it, so this changes no behaviour — it keeps
    // the session's own storage from outliving the session.
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
}

// ── Request interceptor: attach access token ───────────────────────────────
axiosInstance.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            config.headers['Accept'] = 'application/json';
        }

        /*
         * PUT and DELETE never leave the browser.
         *
         * The firewall blocks both verbs at every path, so they travel as a POST naming the real verb
         * in a header; `HttpMethodOverrideFilter` restores it server-side *before* Spring Security
         * reads it, which is what keeps the backend's 17 method-specific authorization rules intact.
         *
         * Done here rather than at the call sites deliberately. The SMS gateway project this pattern
         * comes from sets the header by hand at each call, which is fine at its eight; this
         * application has **53** — 36 `put` and 17 `delete` across 23 service files — and a missed one
         * fails only in production, behind the firewall, where nobody developing will meet it. One
         * choke point means every existing `axiosInstance.put(...)` and `.delete(...)` keeps working
         * untouched, and there is no migration to get wrong.
         *
         * Idempotent on purpose: the 401 refresh path replays the original config through this
         * interceptor again, and by then the method is already `post`, so it does not re-wrap.
         */
        const method = (config.method ?? 'get').toLowerCase();
        if (BLOCKED_METHODS.has(method)) {
            config.headers[METHOD_OVERRIDE_HEADER] = method.toUpperCase();
            config.method = 'post';
        }

        // The firewall wants a CSRF token on anything that changes state. It validates nothing; see
        // `csrfToken` for why that is not the gap it looks like.
        if (method !== 'get' && method !== 'head') {
            config.headers[CSRF_TOKEN_HEADER] = csrfToken();
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

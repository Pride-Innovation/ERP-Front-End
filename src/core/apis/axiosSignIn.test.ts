/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import axiosInstance, { isSessionlessCall } from './axiosInstance';

/**
 * A 401 used to send every call through the session-refresh branch, which ends by navigating to `/`.
 * On the login page that is a reload, and a 401 from any call the page makes on load (`auth/mode` on
 * an older backend) then reloaded it forever: a page that flickered and never settled.
 */
describe('isSessionlessCall', () => {
    it('recognises the public calls a signed-out page makes, however the URL is written', () => {
        expect(isSessionlessCall('auth/login')).toBe(true);
        expect(isSessionlessCall('/auth/login')).toBe(true);
        expect(isSessionlessCall('http://localhost:7777/api/v1/auth/login')).toBe(true);
        expect(isSessionlessCall('auth/login?x=1')).toBe(true);
        expect(isSessionlessCall('auth/mode')).toBe(true);
        expect(isSessionlessCall('auth/verify-email/abc.def')).toBe(true);
        expect(isSessionlessCall('request-password-reset?email=a@b.c')).toBe(true);
        expect(isSessionlessCall('reset-password?token=t&password=p')).toBe(true);
    });

    it('leaves every other call to the refresh logic', () => {
        expect(isSessionlessCall(undefined)).toBe(false);
        expect(isSessionlessCall('assets')).toBe(false);
        expect(isSessionlessCall('auth/refresh-token')).toBe(false);
        expect(isSessionlessCall('auth/login-history')).toBe(false);
        expect(isSessionlessCall('users/me')).toBe(false);
    });
});

describe('a 401 with no session', () => {
    let originalAdapter: unknown;

    beforeAll(() => {
        originalAdapter = axiosInstance.defaults.adapter;
        // Every request is refused 401, as an older backend refuses `auth/mode`
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (axiosInstance.defaults as any).adapter = async (config: InternalAxiosRequestConfig) => {
            throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
                status: 401,
                statusText: 'Unauthorized',
                headers: new AxiosHeaders(),
                config,
                data: { errorCode: 'SESSION_EXPIRED' },
            });
        };
    });

    afterAll(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (axiosInstance.defaults as any).adapter = originalAdapter;
    });

    beforeEach(() => sessionStorage.clear());

    /*
     * The expiry branch ends in a promise that never settles (the page is leaving), so a call taking
     * that branch would hang this test until it times out. Rejecting proves it went to the caller.
     */
    it('is handed back to the caller, not treated as an expired session', async () => {
        await expect(axiosInstance.get('auth/mode')).rejects.toMatchObject({ response: { status: 401 } });
        await expect(axiosInstance.get('assets')).rejects.toMatchObject({ response: { status: 401 } });
        expect(sessionStorage.length).toBe(0);
    });
});

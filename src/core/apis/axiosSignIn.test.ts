/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { isSignInCall } from './axiosInstance';

/**
 * A refused sign-in is a 401, and a 401 used to send the login page through the session-refresh
 * branch: no refresh token, "Your session has expired", reload. These are the calls that must skip it.
 */
describe('isSignInCall', () => {
    it('recognises the login call however its URL is written', () => {
        expect(isSignInCall('auth/login')).toBe(true);
        expect(isSignInCall('/auth/login')).toBe(true);
        expect(isSignInCall('http://localhost:7777/api/v1/auth/login')).toBe(true);
        expect(isSignInCall('auth/login?x=1')).toBe(true);
    });

    it('leaves every other call to the refresh logic', () => {
        expect(isSignInCall(undefined)).toBe(false);
        expect(isSignInCall('assets')).toBe(false);
        expect(isSignInCall('auth/refresh-token')).toBe(false);
        expect(isSignInCall('auth/login-history')).toBe(false);
    });
});

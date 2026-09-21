/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

const RoutesUtills = () => {
    const accessToken: string = 'access-token';
    const currentUser: string = 'current-user';
    const refreshToken: string = 'refreshToken';

    const getCurrentUser = () => {
        return JSON.parse(sessionStorage.getItem(currentUser) || '{}');
    }

    const isAuthenticated = (): boolean => {
        const token = sessionStorage.getItem(accessToken);

        /*
         * `sessionStorage.setItem(key, undefined)` stores the *string* "undefined", which is
         * truthy. A plain `Boolean(token)` therefore reads it as a valid session: `PrivateRoute`
         * admits the user, the dashboard mounts, every call goes out as
         * `Authorization: Bearer undefined`, and the login form is never shown again - so there is
         * no way back in short of clearing browser storage by hand. That is exactly how this
         * deployment failed, and the value survived reloads because sessionStorage only dies with
         * the tab.
         *
         * Storing the value is guarded at both writers now; this is the second half, because a
         * value that is already poisoned has to be survivable too.
         */
        if (!token || token === 'undefined' || token === 'null') return false;
        return true;
    }

    return ({
        getCurrentUser,
        accessToken,
        isAuthenticated,
        currentUser,
        refreshToken
    })
}

export default RoutesUtills;

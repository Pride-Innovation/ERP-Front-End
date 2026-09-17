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
        return Boolean(token);
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

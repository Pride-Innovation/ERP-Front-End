/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import RoutesUtills from "../../core/routes/utills";
import { IUser } from "../users/interface"
import { jwtDecode } from "jwt-decode";

const AuthenticationUtils = () => {
    const { currentUser, accessToken, refreshToken } = RoutesUtills();

    const handleSessionStorage = (user: IUser, token: string, refresh: string) => {
        sessionStorage.setItem(accessToken, token);
        sessionStorage.setItem(currentUser, JSON.stringify(user))
        sessionStorage.setItem(refreshToken, refresh)
    }

    const handleLogout = () => {
        sessionStorage.removeItem(accessToken);
        sessionStorage.removeItem(currentUser)
        sessionStorage.removeItem(refreshToken)
    }

    const decodeUserDetails = (token: string | undefined): object | null => {
        if (!token) return null;

        try {
            const decoded = jwtDecode(token);
            return decoded;
        } catch (error) {
            return null;
        }
    };

    return ({ handleSessionStorage, handleLogout, decodeUserDetails })
}

export default AuthenticationUtils;
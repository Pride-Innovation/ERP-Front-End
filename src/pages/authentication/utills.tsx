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
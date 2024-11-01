import RoutesUtills from "../../core/routes/utills";
import { IUser } from "../users/interface"

const AuthenticationUtils = () => {
    const { currentUser, accessToken } = RoutesUtills();

    const handleSessionStorage = (user: IUser, token: string) => {
        sessionStorage.setItem(accessToken, token);
        sessionStorage.setItem(currentUser, JSON.stringify(user))
    }

    const handleLogout = () => {
        sessionStorage.removeItem(accessToken);
        sessionStorage.removeItem(currentUser)
    }

    return ({ handleSessionStorage, handleLogout })
}

export default AuthenticationUtils;
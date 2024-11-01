import RoutesUtills from "../../core/routes/utills";
import { IUser } from "../users/interface"

const AuthenticationUtils = () => {
    const { currentUser } = RoutesUtills();

    const handleSessionStorage = (user: IUser, token: string) => {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem(currentUser, JSON.stringify(user))
    }

    return ({ handleSessionStorage })
}

export default AuthenticationUtils;
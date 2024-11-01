import { jwtDecode } from "jwt-decode";

const RoutesUtills = () => {
    const accessToken: string = 'access-token';
    const currentUser: string = 'current-user';

    const getCurrentUser = () => {
        return JSON.parse(sessionStorage.getItem(currentUser) || '');
    }

    const isAuthenticated = () => {
        const token = sessionStorage.getItem(accessToken);
        if (token) {
            const { exp } = jwtDecode(token)

            const expirationTime = ((exp as number) * 1000) - 60000

            if (Date.now() >= expirationTime) {
                return false
            }

            return true
        };
        return false;
    }


    return ({
        getCurrentUser,
        accessToken,
        isAuthenticated
    })
}

export default RoutesUtills;
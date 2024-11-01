import { jwtDecode } from "jwt-decode";
import { IPermission } from "../../pages/settings/interface";

const RoutesUtills = () => {
    const accessToken: string = 'access-token';
    const currentUser: string = 'current-user';

    const getCurrentUser = () => {
        return JSON.parse(sessionStorage.getItem(currentUser) || '{}');
    }

    const determinePermission = (permissions: IPermission[], permission: IPermission): boolean => {
        const permissionDetails = permissions.find(perm => perm.id = permission.id);
        if (permissionDetails) return true;
        return false;
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
        // return false;
        return true;
    }


    return ({
        getCurrentUser,
        accessToken,
        isAuthenticated,
        determinePermission,
        currentUser
    })
}

export default RoutesUtills;
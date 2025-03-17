import { permissionsMock } from "../../mocks/settings";
import { IPermission } from "../../pages/settings/interface";

const RoutesUtills = () => {
    const accessToken: string = 'access-token';
    const currentUser: string = 'current-user';
    const refreshToken: string = 'refreshToken';

    const getCurrentUser = () => {
        return JSON.parse(sessionStorage.getItem(currentUser) || '{}');
    }

    const determinePermission = (permission: IPermission): boolean => {
        const permissionDetails = getCurrentUser()?.role?.permissions.find(
            (perm: IPermission) => perm.id === permission.id);
        if (permissionDetails) return true;
        return false;
    }

    const routePermission = (id: number) => permissionsMock.find(perm => perm.id === id);

    const isAuthenticated = () => {
        const token = sessionStorage.getItem(accessToken);
        if (token) {
            return true
        };
        return false;
    }


    return ({
        getCurrentUser,
        accessToken,
        isAuthenticated,
        determinePermission,
        currentUser,
        routePermission,
        refreshToken
    })
}

export default RoutesUtills;
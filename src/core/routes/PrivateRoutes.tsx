import { Navigate, Outlet } from "react-router";
import { ROUTES } from "./routes";
import { IPermission } from "../../pages/settings/interface";
import RoutesUtills from "./utills";

export const PrivateRoute = ({ permission }: { permission?: IPermission }) => {

    const { isAuthenticated, getCurrentUser, determinePermission } = RoutesUtills();

    const currentUser = getCurrentUser();

    const currentUserPermissions: IPermission[] = currentUser.role?.permissions as Array<IPermission>;

    return isAuthenticated() && permission && determinePermission(currentUserPermissions, permission) ? <Outlet /> :
        isAuthenticated() && permission && determinePermission(currentUserPermissions, permission) ? <Navigate to={ROUTES.ERRORS} /> :
            isAuthenticated() && !permission ? <Outlet /> : <Navigate to="/" />;
}

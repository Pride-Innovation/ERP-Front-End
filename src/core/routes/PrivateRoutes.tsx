import { Navigate, Outlet } from "react-router";
import { ROUTES } from "./routes";
import { IPermission } from "../../pages/settings/interface";
import RoutesUtills from "./utills";

export const PrivateRoute = ({ permission }: { permission: IPermission }) => {

    const { isAuthenticated, getCurrentUser } = RoutesUtills();

    const currentUser = getCurrentUser();

    const permissions: IPermission[] = currentUser.role?.permissions as Array<IPermission>;

    return isAuthenticated()
        &&
        permissions.indexOf(permission) !== -1
        ? <Outlet /> :
        isAuthenticated()
            &&
            permissions.indexOf(permission) === -1
            ? <Navigate to={ROUTES.ERRORS} /> :
            <Navigate to="/" />;
}

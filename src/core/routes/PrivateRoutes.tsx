import { Navigate, Outlet } from "react-router";
import { ROUTES } from "./routes";
import { IPermission } from "../../pages/settings/interface";
import RoutesUtills from "./utills";

export const PrivateRoute = ({ permission }: { permission?: IPermission }) => {

    const { isAuthenticated, determinePermission } = RoutesUtills();

    return isAuthenticated() && permission && determinePermission(permission) ? <Outlet /> :
        isAuthenticated() && permission && !determinePermission(permission) ? <Navigate to={ROUTES.ERRORS} /> :
            isAuthenticated() && !permission ? <Outlet /> : <Navigate to="/" />;
}

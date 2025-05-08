/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

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

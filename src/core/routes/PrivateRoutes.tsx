/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Navigate, Outlet } from "react-router";
import { ROUTES } from "./routes";
import RoutesUtills from "./utills";
import usePermissions from "../permissions/usePermissions";
import { PermissionName } from "../permissions/constants";

interface IPrivateRouteProps {
    permission?: PermissionName | string;
    anyOf?: Array<PermissionName | string>;
    allOf?: Array<PermissionName | string>;
}

export const PrivateRoute = ({ permission, anyOf, allOf }: IPrivateRouteProps) => {
    const { isAuthenticated } = RoutesUtills();
    const { has, hasAny, hasAll } = usePermissions();

    if (!isAuthenticated()) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    let allowed = true;
    let missing: string | undefined;

    if (permission) {
        allowed = has(permission);
        missing = permission;
    } else if (anyOf && anyOf.length) {
        allowed = hasAny(anyOf);
        missing = anyOf.join(' or ');
    } else if (allOf && allOf.length) {
        allowed = hasAll(allOf);
        missing = allOf.join(' and ');
    }

    if (!allowed) {
        return <Navigate to={ROUTES.ERRORS} replace state={{ missingPermission: missing }} />;
    }

    return <Outlet />;
};

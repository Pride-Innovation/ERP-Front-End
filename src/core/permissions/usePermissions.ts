/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useMemo } from 'react';
import { IPermission, IRole } from '../../pages/settings/interface';
import { PermissionName, SUPER_ADMIN_ROLE } from './constants';
import RoutesUtills from '../routes/utills';

interface ICurrentUserRoleBearer {
    title?: {
        role?: IRole | null;
    } | null;
    additionalRoles?: Array<IRole> | null;
}

const collectPermissionNames = (user: ICurrentUserRoleBearer): Set<string> => {
    const names = new Set<string>();

    const titleRole = user?.title?.role;
    titleRole?.permissions?.forEach((p: IPermission) => {
        if (p?.name) names.add(p.name);
    });

    user?.additionalRoles?.forEach((role: IRole) => {
        role?.permissions?.forEach((p: IPermission) => {
            if (p?.name) names.add(p.name);
        });
    });

    return names;
};

const collectRoleNames = (user: ICurrentUserRoleBearer): Set<string> => {
    const names = new Set<string>();
    if (user?.title?.role?.name) names.add(user.title.role.name);
    user?.additionalRoles?.forEach((role: IRole) => {
        if (role?.name) names.add(role.name);
    });
    return names;
};

/**
 * Central permission hook. Mirrors the backend authorities model:
 *   effective permissions = title.role.permissions ∪ additionalRoles[].permissions
 * A user whose role name matches SUPER_ADMIN_ROLE bypasses every check.
 */
export const usePermissions = () => {
    const { getCurrentUser } = RoutesUtills();
    const currentUser = getCurrentUser() as ICurrentUserRoleBearer;

    const { permissionSet, roleSet } = useMemo(() => ({
        permissionSet: collectPermissionNames(currentUser),
        roleSet: collectRoleNames(currentUser),
    }), [currentUser]);

    const isSuperAdmin = (): boolean => roleSet.has(SUPER_ADMIN_ROLE);

    const has = (name: PermissionName | string): boolean => {
        if (!name) return false;
        if (isSuperAdmin()) return true;
        return permissionSet.has(name);
    };

    const hasAny = (names: Array<PermissionName | string>): boolean => {
        if (isSuperAdmin()) return true;
        return names.some(n => permissionSet.has(n));
    };

    const hasAll = (names: Array<PermissionName | string>): boolean => {
        if (isSuperAdmin()) return true;
        return names.every(n => permissionSet.has(n));
    };

    return { has, hasAny, hasAll, isSuperAdmin };
};

export default usePermissions;

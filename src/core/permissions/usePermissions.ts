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
    /**
     * The unit the user belongs to, and the roles it confers.
     *
     * A unit used to be a group mailbox with a department — it decided where a workflow step was
     * routed and nothing else, so an Admin Unit officer and a branch officer holding the same title
     * had identical rights. Membership now grants the unit's roles, which is how an Admin or Infra
     * officer reaches beyond their own branch.
     */
    unit?: {
        name?: string | null;
        roles?: Array<IRole> | null;
    } | null;
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

    user?.unit?.roles?.forEach((role: IRole) => {
        role?.permissions?.forEach((p: IPermission) => {
            if (p?.name) names.add(p.name);
        });
    });

    return names;
};

/**
 * Just the permissions the user's unit confers.
 *
 * <p>Provenance, which the flattened set deliberately discards — an endpoint neither knows nor cares
 * where a permission came from, and `has()` should not either. It matters in exactly one place: the
 * dashboard says how far the viewer can see, and someone whose reach comes from their unit rather
 * than their job title has no other way of finding that out. "All branches" leaves them guessing;
 * "All branches · via Admin Unit" tells them which membership to ask about if it looks wrong.
 */
const collectUnitPermissionNames = (user: ICurrentUserRoleBearer): Set<string> => {
    const names = new Set<string>();
    user?.unit?.roles?.forEach((role: IRole) => {
        role?.permissions?.forEach((p: IPermission) => {
            if (p?.name) names.add(p.name);
        });
    });
    return names;
};

/** What the user holds through their own title and additional roles, with the unit left out. */
const collectOwnPermissionNames = (user: ICurrentUserRoleBearer): Set<string> => {
    const names = new Set<string>();
    user?.title?.role?.permissions?.forEach((p: IPermission) => {
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
    user?.unit?.roles?.forEach((role: IRole) => {
        if (role?.name) names.add(role.name);
    });
    return names;
};

/**
 * Central permission hook. Mirrors the backend authorities model:
 *   effective permissions =
 *       title.role.permissions ∪ additionalRoles[].permissions ∪ unit.roles[].permissions
 * A user whose role name matches SUPER_ADMIN_ROLE bypasses every check.
 *
 * The union must stay identical to User#getAuthorities() on the backend. If it drifts, the page
 * renders a control whose endpoint then refuses it — or, worse in the other direction, hides one
 * the user is entitled to and there is nothing on screen to say why.
 */
export const usePermissions = () => {
    const { getCurrentUser } = RoutesUtills();
    const currentUser = getCurrentUser() as ICurrentUserRoleBearer;

    const { permissionSet, roleSet, unitPermissionSet, ownPermissionSet } = useMemo(() => ({
        permissionSet: collectPermissionNames(currentUser),
        roleSet: collectRoleNames(currentUser),
        unitPermissionSet: collectUnitPermissionNames(currentUser),
        ownPermissionSet: collectOwnPermissionNames(currentUser),
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

    /**
     * Whether the user's unit is the <em>only</em> reason they hold this permission.
     *
     * <p>For explaining reach, never for gating it — a permission is a permission whatever granted
     * it, and a check that cared where it came from would disagree with the backend, which does not.
     *
     * <p>"Only" is the point. Someone in Admin Unit whose own title already carries the permission
     * has the same reach either way, and crediting the unit would send them chasing the wrong
     * membership when they wondered about their access.
     */
    const onlyViaUnit = (name: PermissionName | string): boolean =>
        unitPermissionSet.has(name) && !ownPermissionSet.has(name);

    /** The unit's name, where the unit confers anything at all. */
    const unitName = (): string | null =>
        unitPermissionSet.size > 0 ? (currentUser?.unit?.name ?? null) : null;

    return { has, hasAny, hasAll, isSuperAdmin, onlyViaUnit, unitName };
};

export default usePermissions;

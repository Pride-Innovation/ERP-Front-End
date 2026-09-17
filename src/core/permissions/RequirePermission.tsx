/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';
import { PermissionName } from './constants';
import usePermissions from './usePermissions';

interface IRequirePermissionProps {
    permission?: PermissionName | string;
    anyOf?: Array<PermissionName | string>;
    allOf?: Array<PermissionName | string>;
    fallback?: ReactNode;
    children: ReactNode;
}

/**
 * Hides its children unless the current user satisfies the permission check.
 * Pass exactly one of `permission`, `anyOf`, or `allOf`.
 *   <RequirePermission permission={PERMISSIONS.CREATE_USER}><AddUserButton /></RequirePermission>
 *   <RequirePermission anyOf={[PERMISSIONS.APPROVE_REQUEST, PERMISSIONS.REJECT_REQUEST]}>...</RequirePermission>
 */
const RequirePermission = ({
    permission,
    anyOf,
    allOf,
    fallback = null,
    children,
}: IRequirePermissionProps) => {
    const { has, hasAny, hasAll } = usePermissions();

    let allowed = true;
    if (permission) allowed = has(permission);
    else if (anyOf && anyOf.length) allowed = hasAny(anyOf);
    else if (allOf && allOf.length) allowed = hasAll(allOf);

    return <>{allowed ? children : fallback}</>;
};

export default RequirePermission;

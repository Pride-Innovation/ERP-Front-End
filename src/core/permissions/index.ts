/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

export { PERMISSIONS, SUPER_ADMIN_ROLE } from './constants';
export type { PermissionName } from './constants';
export { default as usePermissions } from './usePermissions';
export { default as RequirePermission } from './RequirePermission';

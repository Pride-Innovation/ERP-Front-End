/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

// Permission names mirror the seeded values in the backend
// (see ERP-Back-End: pride.bank.erp.helper.Constants). Compare by name, never by id —
// ids can shift between environments, names are stable.

export const PERMISSIONS = {
    READ_PERMISSION: 'READ_PERMISSION',
    CREATE_PERMISSION: 'CREATE_PERMISSION',
    UPDATE_PERMISSION: 'UPDATE_PERMISSION',
    DELETE_PERMISSION: 'DELETE_PERMISSION',

    READ_ROLE: 'READ_ROLE',
    CREATE_ROLE: 'CREATE_ROLE',
    UPDATE_ROLE: 'UPDATE_ROLE',
    DELETE_ROLE: 'DELETE_ROLE',

    READ_USER: 'READ_USER',
    CREATE_USER: 'CREATE_USER',
    UPDATE_USER: 'UPDATE_USER',
    DELETE_USER: 'DELETE_USER',

    READ_REQUEST: 'READ_REQUEST',
    CREATE_REQUEST: 'CREATE_REQUEST',
    UPDATE_REQUEST: 'UPDATE_REQUEST',
    DELETE_REQUEST: 'DELETE_REQUEST',

    CREATE_STATUS: 'CREATE_STATUS',
    UPDATE_STATUS: 'UPDATE_STATUS',
    DELETE_STATUS: 'DELETE_STATUS',

    READ_TRANSPORT: 'READ_TRANSPORT',
    CREATE_TRANSPORT: 'CREATE_TRANSPORT',
    UPDATE_TRANSPORT: 'UPDATE_TRANSPORT',
    DELETE_TRANSPORT: 'DELETE_TRANSPORT',

    READ_INVENTORY: 'READ_INVENTORY',
    CREATE_INVENTORY: 'CREATE_INVENTORY',
    UPDATE_INVENTORY: 'UPDATE_INVENTORY',
    DELETE_INVENTORY: 'DELETE_INVENTORY',

    READ_SETTING: 'READ_SETTING',
    CREATE_SETTING: 'CREATE_SETTING',
    UPDATE_SETTING: 'UPDATE_SETTING',
    DELETE_SETTING: 'DELETE_SETTING',

    READ_AUDIT: 'READ_AUDIT',
    CREATE_AUDIT: 'CREATE_AUDIT',
    UPDATE_AUDIT: 'UPDATE_AUDIT',
    DELETE_AUDIT: 'DELETE_AUDIT',

    READ_STORE: 'READ_STORE',
    CREATE_STORE: 'CREATE_STORE',
    UPDATE_STORE: 'UPDATE_STORE',
    DELETE_STORE: 'DELETE_STORE',

    READ_ASSET: 'READ_ASSET',
    CREATE_ASSET: 'CREATE_ASSET',
    UPDATE_ASSET: 'UPDATE_ASSET',
    DELETE_ASSET: 'DELETE_ASSET',

    APPROVE_REQUEST: 'APPROVE_REQUEST',
    REJECT_REQUEST: 'REJECT_REQUEST',
    ISSUE_ITEMS: 'ISSUE_ITEMS',
    ACKNOWLEDGE_REQUEST: 'ACKNOWLEDGE_REQUEST',
    APPROVE_ISSUANCE: 'APPROVE_ISSUANCE',

    /**
     * Lifts the "your branch only" restriction — the holder sees every branch plus Head Office.
     * Granted and revoked like any other permission, so Head Office staff who need a national
     * view get it and branch staff do not. Mirrors the backend's BranchScopeService, which
     * enforces the same rule server-side; this constant only decides what the UI offers.
     */
    VIEW_ALL_BRANCHES: 'VIEW_ALL_BRANCHES',
} as const;

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role that bypasses every permission check. Must match the backend seed
// (pride.bank.erp.helper.Constants.SUPER_ADMIN).
export const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';

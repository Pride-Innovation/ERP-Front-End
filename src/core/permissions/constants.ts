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

    /*
     * Asset lifecycle actions — the row menu on the asset register.
     *
     * Separate from CREATE_ASSET / UPDATE_ASSET because the backend route rules match on the HTTP
     * verb, which folded reassign, repair and bulk import into "create" and receive-into-store into
     * "update". Anyone who could correct a model number could also hand the asset into a store.
     */
    REASSIGN_ASSET: 'REASSIGN_ASSET',
    REPAIR_ASSET: 'REPAIR_ASSET',
    RECEIVE_ASSET_IN_STORE: 'RECEIVE_ASSET_IN_STORE',
    DISPOSE_ASSET: 'DISPOSE_ASSET',
    IMPORT_ASSET: 'IMPORT_ASSET',
    EXPORT_ASSET: 'EXPORT_ASSET',

    /*
     * Stock take. Present in the backend seed but absent here, so nothing in the UI could ask about
     * them — counting is a designated duty and the counter must not approve their own variances.
     */
    READ_STOCK_TAKE: 'READ_STOCK_TAKE',
    PERFORM_STOCK_TAKE: 'PERFORM_STOCK_TAKE',
    APPROVE_STOCK_TAKE: 'APPROVE_STOCK_TAKE',

    /*
     * Movements and consignments — the module that physically moves stock between buildings.
     *
     * Dispatch and receive are separate from create on purpose: raising a transfer and handing
     * custody over are different acts by different people. APPROVE_MOVEMENT also authorises the
     * approval *bypass*, which is a flag on the create payload rather than an endpoint — see the
     * backend's MovementApprovalService.
     */
    READ_MOVEMENT: 'READ_MOVEMENT',
    CREATE_MOVEMENT: 'CREATE_MOVEMENT',
    DISPATCH_MOVEMENT: 'DISPATCH_MOVEMENT',
    RECEIVE_MOVEMENT: 'RECEIVE_MOVEMENT',
    CANCEL_MOVEMENT: 'CANCEL_MOVEMENT',
    APPROVE_MOVEMENT: 'APPROVE_MOVEMENT',

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

    /*
     * Dashboard — subject and scope.
     *
     * Deliberately separate from the READ_* permissions above. READ_ASSET answers "may you open the
     * assets page"; the dashboard needs a different answer — "how much of the estate may you see
     * summarised". Borrowing one for the other is what made a branch officer's KPI band show the
     * whole branch's totals when all he needed was access to his own asset's detail page.
     *
     * Must match pride.bank.erp.helper.Constants on the backend.
     */
    DASH_VIEW_ASSETS: 'DASH_VIEW_ASSETS',
    DASH_VIEW_REQUESTS: 'DASH_VIEW_REQUESTS',
    DASH_VIEW_STOCK: 'DASH_VIEW_STOCK',
    DASH_VIEW_MOVEMENTS: 'DASH_VIEW_MOVEMENTS',
    /** Scope is a ladder — the highest held wins. See DashboardScope on the backend. */
    DASH_SCOPE_SELF: 'DASH_SCOPE_SELF',
    DASH_SCOPE_BRANCH: 'DASH_SCOPE_BRANCH',
    DASH_SCOPE_ALL: 'DASH_SCOPE_ALL',
} as const;

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role that bypasses every permission check. Must match the backend seed
// (pride.bank.erp.helper.Constants.SUPER_ADMIN).
export const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';

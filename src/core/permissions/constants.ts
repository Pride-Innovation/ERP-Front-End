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
    /**
     * Decides which columns each table puts into its exported PDF / Excel.
     *
     * <p>A formatting right, not a disclosure one — every column stays visible on screen to anyone
     * who can open the table, and the file is still built in the browser. Separate from
     * UPDATE_SETTING because tidying reports is an everyday editorial job, while that one reaches
     * branches, titles, units and the approval workflows.
     */
    UPDATE_EXPORT_COLUMNS: 'UPDATE_EXPORT_COLUMNS',
    /**
     * Enabling, disabling, blocking and unblocking an account, and returning somebody from leave.
     *
     * <p>Carved out of `CREATE_USER`, which these inherited only because they are POSTs under
     * `/users/**`. Creating a member of staff and suspending one are different decisions, and the
     * second should be grantable without the first.
     */
    MANAGE_USER_ACCESS: 'MANAGE_USER_ACCESS',
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
    /*
     * An asset's trail, carved out of READ_ASSET.
     *
     * Seeing what an asset is, and seeing everyone who has ever held it, are separate disclosures —
     * the second says where a named member of staff was working and what they were issued. Reading
     * the maintenance record is likewise a different duty from performing the repair.
     *
     * Both are narrowing: the asset's branch scope still applies on top, so holding one grants the
     * trail of assets already in reach, never more.
     */
    READ_ASSIGNMENT_HISTORY: 'READ_ASSIGNMENT_HISTORY',
    READ_REPAIR_HISTORY: 'READ_REPAIR_HISTORY',

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

    /*
     * Cross-branch multipliers.
     *
     * These widen a permission the holder already has; alone they grant nothing. VIEW_ALL_BRANCH_ASSETS
     * does not let anyone open the assets page — READ_ASSET does that — it changes how much of the
     * register they see once they are on it. Written this way so that granting one cannot accidentally
     * open a door, only widen a door already open.
     *
     * This is what a unit confers. Membership of Admin or Infra grants the unit's roles, which is how
     * an Admin Unit officer comes to outrank a branch officer holding the same title.
     *
     * Must match pride.bank.erp.helper.Constants on the backend.
     */
    VIEW_ALL_BRANCH_ASSETS: 'VIEW_ALL_BRANCH_ASSETS',
    MANAGE_ALL_BRANCH_ASSETS: 'MANAGE_ALL_BRANCH_ASSETS',
    VIEW_ALL_BRANCH_REQUESTS: 'VIEW_ALL_BRANCH_REQUESTS',
    MANAGE_ALL_BRANCH_REQUESTS: 'MANAGE_ALL_BRANCH_REQUESTS',
    VIEW_ALL_BRANCH_MOVEMENTS: 'VIEW_ALL_BRANCH_MOVEMENTS',
    MANAGE_ALL_BRANCH_MOVEMENTS: 'MANAGE_ALL_BRANCH_MOVEMENTS',
    VIEW_ALL_BRANCH_INVENTORY: 'VIEW_ALL_BRANCH_INVENTORY',
    MANAGE_ALL_BRANCH_INVENTORY: 'MANAGE_ALL_BRANCH_INVENTORY',
} as const;

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role that bypasses every permission check. Must match the backend seed
// (pride.bank.erp.helper.Constants.SUPER_ADMIN).
export const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';

/**
 * What a permission actually lets someone do, in the words an administrator would use.
 *
 * <p>For the confirmation dialog that runs before a unit's roles are changed. A list of names like
 * MANAGE_ALL_BRANCH_ASSETS tells whoever is granting it nothing about the consequence — that
 * everyone in the unit can now edit and delete any branch's asset — and the whole reason the dialog
 * exists is that this grant is invisible from the accounts it affects.
 *
 * <p>Only the permissions whose consequences are easy to misjudge are described. Anything absent
 * falls back to its own name, which is honest: better a bare name than a friendly gloss that
 * quietly understates what is being handed over.
 */
export const PERMISSION_CONSEQUENCES: Record<string, string> = {
    VIEW_ALL_BRANCH_ASSETS: 'See assets at every branch and Head Office, not just their own',
    MANAGE_ALL_BRANCH_ASSETS: 'Create, edit and reassign assets at every branch',
    VIEW_ALL_BRANCH_REQUESTS: 'See every branch’s requests from the moment they are raised',
    MANAGE_ALL_BRANCH_REQUESTS: 'Act on and edit requests belonging to any branch',
    VIEW_ALL_BRANCH_MOVEMENTS: 'See stock movements and consignments at every branch',
    MANAGE_ALL_BRANCH_MOVEMENTS: 'Create, dispatch and receive movements for any branch',
    VIEW_ALL_BRANCH_INVENTORY: 'See stock balances and store contents at every branch',
    MANAGE_ALL_BRANCH_INVENTORY: 'Adjust stock and store records at any branch',
    VIEW_ALL_BRANCHES: 'Lift the “your branch only” restriction across the application',
    DASH_SCOPE_ALL: 'Dashboard figures cover the whole bank',
    DASH_SCOPE_BRANCH: 'Dashboard figures cover their whole branch',
    DASH_SCOPE_SELF: 'Dashboard figures cover only their own records',
    DELETE_ASSET: 'Delete asset records',
    READ_ASSIGNMENT_HISTORY: 'See who has held an asset, and when',
    READ_REPAIR_HISTORY: 'See an asset’s repair and maintenance record',
    DELETE_USER: 'Delete user accounts',
    DELETE_ROLE: 'Delete roles',
    UPDATE_ROLE: 'Change what every role in the bank grants',
    DISPOSE_ASSET: 'Write assets off',
    EXPORT_ASSET: 'Export the whole asset register to a file',
};

/**
 * Permissions that widen someone’s reach past their own branch.
 *
 * <p>Called out separately in the confirmation dialog because they are the ones that surprise
 * people: they are invisible on the affected user’s own account, and branch isolation is what
 * everyone assumes is in force unless told otherwise.
 */
export const CROSS_BRANCH_PERMISSIONS: ReadonlyArray<string> = [
    PERMISSIONS.VIEW_ALL_BRANCH_ASSETS,
    PERMISSIONS.MANAGE_ALL_BRANCH_ASSETS,
    PERMISSIONS.VIEW_ALL_BRANCH_REQUESTS,
    PERMISSIONS.MANAGE_ALL_BRANCH_REQUESTS,
    PERMISSIONS.VIEW_ALL_BRANCH_MOVEMENTS,
    PERMISSIONS.MANAGE_ALL_BRANCH_MOVEMENTS,
    PERMISSIONS.VIEW_ALL_BRANCH_INVENTORY,
    PERMISSIONS.MANAGE_ALL_BRANCH_INVENTORY,
    PERMISSIONS.VIEW_ALL_BRANCHES,
    PERMISSIONS.DASH_SCOPE_ALL,
];

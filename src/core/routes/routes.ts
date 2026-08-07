/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

const LOGIN: string = "/";
const FORGOT_PASSWORD: string = "/forgot-password";
const RESET_PASSWORD: string = '/reset-password';
const ASSETS_MANAGEMENT: string = "/assets-mgt"
const REFRESH_TOKEN: string = "/auth/refresh-token"
const SETTINGS: string = `${ASSETS_MANAGEMENT}/settings`;
const PROFILE: string = `${ASSETS_MANAGEMENT}/profile`;
const USERS: string = `${ASSETS_MANAGEMENT}/users`;
const CREATE_USER: string = `${USERS}/create`;
const UPDATE_USER: string = `${USERS}/update`;
const AUDIT_TRAILS: string = `${ASSETS_MANAGEMENT}/trails`;
const TEST: string = `${ASSETS_MANAGEMENT}/test`;
const STORE: string = `${ASSETS_MANAGEMENT}/store`;

/* Store Sub-Routes */
const STORE_ADMIN: string = `${STORE}/admin`;
const STORE_IT: string = `${STORE}/it`;
const STORE_DISPOSAL: string = `${STORE}/disposal`;
/** What the signed-in user is personally holding — not a store, a personal accountability view. */
const MY_ITEMS: string = `${STORE}/my-items`;
/** Counting a store and reconciling its balances to the shelf. */
const STOCK_TAKE: string = `${STORE}/stock-take`;

/* Inventory Routes */
const INVENTORY: string = `${ASSETS_MANAGEMENT}/inventory`;
const CREATE_INVENTORY: string = `${ASSETS_MANAGEMENT}/inventory/create`
const UPDATE_INVENTORY: string = `${ASSETS_MANAGEMENT}/inventory/update`
const READ_INVENTORY: string = `${ASSETS_MANAGEMENT}/inventory/view`
/** Read-only report: order lines where the GRN trail or asset register disagrees with the order. */
const INVENTORY_RECONCILIATION: string = `${ASSETS_MANAGEMENT}/inventory/reconciliation`

/* Request Routes */
const REQUEST: string = `${ASSETS_MANAGEMENT}/asset-request`
const CREATE_REQUEST: string = `${ASSETS_MANAGEMENT}/asset-request/create`
const UPDATE_REQUEST: string = `${ASSETS_MANAGEMENT}/asset-request/update`
const READ_REQUEST: string = `${ASSETS_MANAGEMENT}/asset-request/view`
const ISSUE_REQUEST: string = `${ASSETS_MANAGEMENT}/issue-request/view`

/* Transport Request Routes */
const TRANSPORT_REQUEST: string = `${ASSETS_MANAGEMENT}/transport-request`
const CREATE_TRANSPORT_REQUEST: string = `${ASSETS_MANAGEMENT}/transport-request/create`
const UPDATE_TRANSPORT_REQUEST: string = `${ASSETS_MANAGEMENT}/transport-request/update`

/* Request Subroutes Routes */
const LIST_ALL: string = `${REQUEST}/all`
const LIST_PENDING: string = `${REQUEST}/pending`
const LIST_REJECTED: string = `${REQUEST}/rejected`
const LIST_ISSUED: string = `${REQUEST}/issued`

/* Request Subroutes Routes */
const LIST_TRANSPORT_PENDING: string = `${TRANSPORT_REQUEST}/pending`
const LIST_TRANSPORT_REJECTED: string = `${TRANSPORT_REQUEST}/rejected`

/* Asset Routes — the per-category list/create/update/view all flow through
 * the single parameterised `/assets/general/:typeId` pattern below. There are
 * intentionally no hardcoded category routes (no `/it-equipment`, no `/fleet`,
 * no `/office-equipment`) — adding a new category in Settings → Asset
 * Categories is the only thing required to expose it in the UI. */
const LIST_ASSETS: string = `${ASSETS_MANAGEMENT}/assets`
const LIST_GENERAL_ASSETS: string = `${LIST_ASSETS}/general`

/* Dedicated full-page list of the logged-in user's notifications. */
const NOTIFICATIONS: string = `${ASSETS_MANAGEMENT}/notifications`

/* Settings Routes */
const BRANCHES: string = `${ASSETS_MANAGEMENT}/settings/branches`;
const COMMODITY: string = `${ASSETS_MANAGEMENT}/settings/commodities`;
const TITLES: string = `${ASSETS_MANAGEMENT}/settings/titles`;
const SUPPLIERS: string = `${ASSETS_MANAGEMENT}/settings/suppliers`;
const REGIONS: string = `${ASSETS_MANAGEMENT}/settings/regions`;
const DEPARTMENT: string = `${ASSETS_MANAGEMENT}/settings/departments`;
const UNITS: string = `${ASSETS_MANAGEMENT}/settings/units`;
const ASSET_TYPES: string = `${ASSETS_MANAGEMENT}/settings/asset-categories`;
const CONSULTANTS: string = `${ASSETS_MANAGEMENT}/settings/consultants`;
const COURIERS: string = `${ASSETS_MANAGEMENT}/settings/couriers`;

const APPROVAL_WORKFLOWS: string = `${ASSETS_MANAGEMENT}/approval-workflows`;

/* Errors Page */
const ERRORS: string = `${ASSETS_MANAGEMENT}/restricted-access`


/* Reports Routes */
const REPORTS: string = `${ASSETS_MANAGEMENT}/reports`;

/* Movement Routes */
const MOVEMENT: string = `${ASSETS_MANAGEMENT}/movement`;
const CREATE_MOVEMENT: string = `${ASSETS_MANAGEMENT}/movement/create`
const UPDATE_MOVEMENT: string = `${ASSETS_MANAGEMENT}/movement/update`
const READ_MOVEMENT: string = `${ASSETS_MANAGEMENT}/movement/view`
/** Consignments — the physical journeys that movements ride on. */
const CONSIGNMENTS: string = `${ASSETS_MANAGEMENT}/movement/consignments`

export const ROUTES = {
    FORGOT_PASSWORD,
    LOGIN,
    RESET_PASSWORD,
    SETTINGS,
    ASSETS_MANAGEMENT,
    PROFILE,
    USERS,
    REFRESH_TOKEN,
    AUDIT_TRAILS,
    TEST,
    LIST_ASSETS,
    REQUEST,
    CREATE_REQUEST,
    UPDATE_REQUEST,
    READ_REQUEST,
    ISSUE_REQUEST,
    LIST_GENERAL_ASSETS,
    ERRORS,
    LIST_ALL,
    LIST_PENDING,
    LIST_REJECTED,
    LIST_ISSUED,
    TRANSPORT_REQUEST,
    CREATE_TRANSPORT_REQUEST,
    UPDATE_TRANSPORT_REQUEST,
    LIST_TRANSPORT_PENDING,
    LIST_TRANSPORT_REJECTED,
    BRANCHES,
    COMMODITY,
    TITLES,
    SUPPLIERS,
    REGIONS,
    INVENTORY,
    DEPARTMENT,
    UNITS,
    ASSET_TYPES,
    CONSULTANTS,
    COURIERS,
    CREATE_INVENTORY,
    UPDATE_INVENTORY,
    READ_INVENTORY,
    INVENTORY_RECONCILIATION,
    CREATE_USER,
    UPDATE_USER,
    STORE,
    STORE_ADMIN,
    STORE_IT,
    STORE_DISPOSAL,
    MY_ITEMS,
    STOCK_TAKE,
    MOVEMENT,
    CREATE_MOVEMENT,
    UPDATE_MOVEMENT,
    READ_MOVEMENT,
    CONSIGNMENTS,
    REPORTS,
    APPROVAL_WORKFLOWS,
    NOTIFICATIONS
}
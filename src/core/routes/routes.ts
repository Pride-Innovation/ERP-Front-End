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
const REFRESH_TOKEN: string = "/auth/refresh"
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

/* Inventory Routes */
const INVENTORY: string = `${ASSETS_MANAGEMENT}/inventory`;
const CREATE_INVENTORY: string = `${ASSETS_MANAGEMENT}/inventory/create`
const UPDATE_INVENTORY: string = `${ASSETS_MANAGEMENT}/inventory/update`
const READ_INVENTORY: string = `${ASSETS_MANAGEMENT}/inventory/view`

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

/* IT Equipment Routes */
const LIST_ASSETS: string = `${ASSETS_MANAGEMENT}/assets`
const LIST_IT_EQUIPMENT: string = `${LIST_ASSETS}/it-equipment`
const CREATE_ITEQUIPMENT: string = `${LIST_ASSETS}/it-equipment/create`
const UPDATE_ITEQUIPMENT: string = `${LIST_ASSETS}/it-equipment/update`

/* Fleet Routes */
const LIST_FLEET: string = `${LIST_ASSETS}/fleet`
const CREATE_FLEET: string = `${LIST_ASSETS}/fleet/create`
const UPDATE_FLEET: string = `${LIST_ASSETS}/fleet/update`

/* Office Equipment Routes */
const LIST_OFFICE_EQUIPMENT: string = `${LIST_ASSETS}/office-equipment`
const CREATE_OFFICE_EQUIPMENT: string = `${LIST_ASSETS}/office-equipment/create`
const UPDATE_OFFICE_EQUIPMENT: string = `${LIST_ASSETS}/office-equipment/update`

/* General Asset Routes (all non-specialized categories) */
const LIST_GENERAL_ASSETS: string = `${LIST_ASSETS}/general`

/* Settings Routes */
const BRANCHES: string = `${ASSETS_MANAGEMENT}/settings/branches`;
const COMMODITY: string = `${ASSETS_MANAGEMENT}/settings/commodities`;
const TITLES: string = `${ASSETS_MANAGEMENT}/settings/titles`;
const SUPPLIERS: string = `${ASSETS_MANAGEMENT}/settings/suppliers`;
const REGIONS: string = `${ASSETS_MANAGEMENT}/settings/regions`;
const DEPARTMENT: string = `${ASSETS_MANAGEMENT}/settings/departments`;
const ASSET_TYPES: string = `${ASSETS_MANAGEMENT}/settings/asset-categories`;

/* Errors Page */
const ERRORS: string = `${ASSETS_MANAGEMENT}/restricted-access`


/* Reports Routes */
const REPORTS: string = `${ASSETS_MANAGEMENT}/reports`;

/* Movement Routes */
const MOVEMENT: string = `${ASSETS_MANAGEMENT}/movement`;
const CREATE_MOVEMENT: string = `${ASSETS_MANAGEMENT}/movement/create`
const UPDATE_MOVEMENT: string = `${ASSETS_MANAGEMENT}/movement/update`
const READ_MOVEMENT: string = `${ASSETS_MANAGEMENT}/movement/view`

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
    LIST_IT_EQUIPMENT,
    CREATE_ITEQUIPMENT,
    UPDATE_ITEQUIPMENT,
    REQUEST,
    CREATE_REQUEST,
    UPDATE_REQUEST,
    READ_REQUEST,
    ISSUE_REQUEST,
    LIST_OFFICE_EQUIPMENT,
    LIST_FLEET,
    CREATE_FLEET,
    UPDATE_FLEET,
    CREATE_OFFICE_EQUIPMENT,
    UPDATE_OFFICE_EQUIPMENT,
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
    ASSET_TYPES,
    CREATE_INVENTORY,
    UPDATE_INVENTORY,
    READ_INVENTORY,
    CREATE_USER,
    UPDATE_USER,
    STORE,
    STORE_ADMIN,
    STORE_IT,
    STORE_DISPOSAL,
    MOVEMENT,
    CREATE_MOVEMENT,
    UPDATE_MOVEMENT,
    READ_MOVEMENT,
    REPORTS
}
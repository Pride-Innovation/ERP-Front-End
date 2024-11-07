const LOGIN: string = "/";
const FORGOT_PASSWORD: string = "/forgot-password";
const ASSETS_MANAGEMENT: string = "/assets-mgt"
const REFRESH_TOKEN: string = "/auth/refresh"
const SETTINGS: string = `${ASSETS_MANAGEMENT}/settings`;
const PROFILE: string = `${ASSETS_MANAGEMENT}/profile`;
const USERS: string = `${ASSETS_MANAGEMENT}/users`;
const AUDIT_TRAILS: string = `${ASSETS_MANAGEMENT}/trails`;
const TEST: string = `${ASSETS_MANAGEMENT}/test`;

/* Request Routes */
const REQUEST: string = `${ASSETS_MANAGEMENT}/request`
const CREATE_REQUEST: string = `${ASSETS_MANAGEMENT}/request/create`
const UPDATE_REQUEST: string = `${ASSETS_MANAGEMENT}/request/update`

/* Request Subroutes Routes */
const LIST_PENDING: string = `${REQUEST}/pending`
const LIST_REJECTED: string = `${REQUEST}/rejected`

/* IT Equipment Routes */
const LIST_ASSETS: string = `${ASSETS_MANAGEMENT}/assets`
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

/* Errors Page */
const ERRORS: string = `${ASSETS_MANAGEMENT}/restricted-access`

export const ROUTES = {
    FORGOT_PASSWORD,
    LOGIN,
    SETTINGS,
    ASSETS_MANAGEMENT,
    PROFILE,
    USERS,
    REFRESH_TOKEN,
    AUDIT_TRAILS,
    TEST,
    LIST_ASSETS,
    CREATE_ITEQUIPMENT,
    UPDATE_ITEQUIPMENT,
    REQUEST,
    CREATE_REQUEST,
    UPDATE_REQUEST,
    LIST_OFFICE_EQUIPMENT,
    LIST_FLEET,
    CREATE_FLEET,
    UPDATE_FLEET,
    CREATE_OFFICE_EQUIPMENT,
    UPDATE_OFFICE_EQUIPMENT,
    ERRORS,
    LIST_PENDING,
    LIST_REJECTED
}
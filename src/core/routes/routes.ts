const LOGIN: string = "/";
const FORGOT_PASSWORD: string = "/forgot-password";
const ASSETS_MANAGEMENT: string = "/assets-mgt"
const REFRESH_TOKEN: string = "/auth/refresh"
const SETTINGS: string = `${ASSETS_MANAGEMENT}/settings`;
const PROFILE: string = `${ASSETS_MANAGEMENT}/profile`;
const USERS: string = `${ASSETS_MANAGEMENT}/users`;
const AUDIT_TRAILS: string = `${ASSETS_MANAGEMENT}/trails`;
const TEST: string = `${ASSETS_MANAGEMENT}/test`;
const LIST_ASSETS: string = `${ASSETS_MANAGEMENT}/assets`
const CREATE_ITEQUIPMENT: string = `${LIST_ASSETS}/create-it-equipment`
const UPDATE_ITEQUIPMENT: string = `${LIST_ASSETS}/update-it-equipment`
const REQUEST: string = `${ASSETS_MANAGEMENT}/request`
const CREATE_REQUEST: string = `${ASSETS_MANAGEMENT}/request/create`
const UPDATE_REQUEST: string = `${ASSETS_MANAGEMENT}/request/update`
const LIST_OFFICE_EQUIPMENT: string = `${LIST_ASSETS}/office-equipment`
const LIST_FLEET: string = `${LIST_ASSETS}/fleet`
const CREATE_FLEET: string = `${LIST_ASSETS}/create-fleet`
const UPDATE_FLEET: string = `${LIST_ASSETS}/update-fleet`
const CREATE_OFFICE_EQUIPMENT: string = `${LIST_ASSETS}/create-office-equipment`
const UPDATE_OFFICE_EQUIPMENT: string = `${LIST_ASSETS}/update-office-equipment`


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
    UPDATE_OFFICE_EQUIPMENT
}
const LOGIN: string = "/";
const FORGOT_PASSWORD: string = "/forgot-password";
const ASSETS_MANAGEMENT: string = "/assets-mgt"
const REFRESH_TOKEN: string = "/auth/refresh"
const SETTINGS: string = `${ASSETS_MANAGEMENT}/settings`;
const PROFILE: string = `${ASSETS_MANAGEMENT}/profile`;
const USERS: string = `${ASSETS_MANAGEMENT}/users`;
const AUDIT_TRAILS: string = `${ASSETS_MANAGEMENT}/trails`;
const TEST: string = `${ASSETS_MANAGEMENT}/test`;
const LIST_ASSETS: string = `${ASSETS_MANAGEMENT}/assets-list`
const CREATE_ASSET: string = `${ASSETS_MANAGEMENT}/create-asset`
const UPDATE_ASSET: string = `${ASSETS_MANAGEMENT}/update-asset`

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
    CREATE_ASSET,
    UPDATE_ASSET
}
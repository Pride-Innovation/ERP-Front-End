/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { PERMISSIONS, PermissionName } from '../../core/permissions/constants';

/**
 * The permission each Reports tab's endpoint demands - and so whether the tab is shown.
 *
 * <p>One list for three readers: the tab bar, the route guard and the sidebar link. They were three
 * hand-written lists, and they drifted: the Maintenance tab asked for READ_ASSET while its endpoint
 * (`GET /assets/repairs`) answers to READ_REPAIR_HISTORY - a rule matched before the general
 * `/assets/**` one - so a READ_ASSET holder without it saw a tab that could only fail, and a holder
 * of READ_REPAIR_HISTORY alone could not open the page at all.
 */
export const REPORT_TAB_PERMISSIONS = {
    stock: PERMISSIONS.READ_INVENTORY,          // GET /stocks/**
    assets: PERMISSIONS.READ_ASSET,             // GET /assets
    requests: PERMISSIONS.READ_REQUEST,         // GET /requests/**
    movements: PERMISSIONS.READ_MOVEMENT,       // GET /movements
    disposal: PERMISSIONS.READ_ASSET,           // GET /assets, written-off flag
    maintenance: PERMISSIONS.READ_REPAIR_HISTORY, // GET /assets/repairs
} satisfies Record<string, PermissionName>;

/** The page opens for anyone who can load at least one tab. */
export const REPORT_PAGE_PERMISSIONS: PermissionName[] =
    Array.from(new Set(Object.values(REPORT_TAB_PERMISSIONS)));

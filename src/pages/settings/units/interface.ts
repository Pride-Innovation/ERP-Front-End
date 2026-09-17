/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IAxiosResponse, IFetchDataRequest } from "../../../core/apis/interface";

/** A role a unit confers, with the permissions it carries flattened onto it. */
export interface IUnitRole {
    id: number;
    name: string;
    description?: string | null;
    /** Permission names. Sent with the role so the confirmation dialog needs no second call. */
    permissions?: Array<string> | null;
}

export interface IUnit {
    id?: number;
    name: string;
    groupEmail?: string | null;
    department?: {
        id: number;
        name: string;
        shortCode?: string | null;
    } | null;
    /**
     * The roles membership of this unit confers.
     *
     * A unit was a group mailbox with a department and nothing more; this is what changed. Everyone
     * in the unit inherits every permission behind every role here, without anything being done to
     * their own account — which is why the screen that edits it asks for confirmation first.
     */
    roles?: Array<IUnitRole> | null;
}

export interface IUnitResponse extends IFetchDataRequest {
    content: Array<IUnit>;
}

export interface IUnitsAxiosResponse extends IAxiosResponse {
    data: IUnitResponse;
}

export interface IUnitAxiosResponse extends IAxiosResponse {
    data: IUnit;
}

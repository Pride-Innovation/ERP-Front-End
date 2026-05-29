/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IAxiosResponse, IFetchDataRequest } from "../../../core/apis/interface";

export interface IUnit {
    id?: number;
    name: string;
    groupEmail?: string | null;
    department?: {
        id: number;
        name: string;
        shortCode?: string | null;
    } | null;
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

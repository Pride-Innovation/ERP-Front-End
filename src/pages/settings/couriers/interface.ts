/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IAxiosResponse } from "../../../core/apis/interface";

/** A courier that can hold custody of stock while an inter-location movement is in transit. */
export interface ICourier {
    id?: number;
    name: string;
    contactPerson?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    vetted?: boolean | null;
    active?: boolean | null;
}

export interface ICourierFormValues {
    name: string;
    contactPerson?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    vetted?: boolean;
    active?: boolean;
}

/** The couriers endpoint returns a plain (non-paginated) list. */
export interface ICouriersAxiosResponse extends IAxiosResponse {
    data: Array<ICourier>;
}

export interface ICourierAxiosResponse extends IAxiosResponse {
    data: ICourier;
}

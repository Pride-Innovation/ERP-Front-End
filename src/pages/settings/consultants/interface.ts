/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IAxiosResponse } from "../../../core/apis/interface";

/** An external repair vendor assets are dispatched to for EXTERNAL-routed repairs. */
export interface IConsultant {
    id?: number;
    name: string;
    contactPerson?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    specialization?: string | null;
    active?: boolean | null;
}

export interface IConsultantFormValues {
    name: string;
    contactPerson?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    specialization?: string | null;
    active?: boolean;
}

/** The consultants endpoint returns a plain (non-paginated) list. */
export interface IConsultantsAxiosResponse extends IAxiosResponse {
    data: Array<IConsultant>;
}

export interface IConsultantAxiosResponse extends IAxiosResponse {
    data: IConsultant;
}

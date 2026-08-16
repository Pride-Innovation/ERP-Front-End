
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IAxiosResponse, IFetchDataRequest } from "../../core/apis/interface";
import { IBranch } from "../settings/branch/interface";
import { ICommodity } from "../settings/commodity/interface";
import { IStatus } from "../settings/statuses/interface";
import { IUser } from "../users/interface";


/** The typed container (Admin / IT / Disposal) a balance line sits in. */
export interface IStoreContainer {
    id?: number | string;
    name?: string;
    storeType?: string;
    active?: boolean;
}

/** One commodity's on-hand quantity in one store — the backend's StoreBalance. */
export interface IStore {
    id?: number | string;
    quantity: number;
    /** Reorder threshold. 0 (the default) means the line is never flagged low. */
    minLevel?: number;
    commodity: ICommodity;
    branch: IBranch;
    store?: IStoreContainer | null;
    createDate?: string | null;
    lastModified?: string | null;
}

export interface IStoreResponse extends IFetchDataRequest {
    content: Array<IStore>
}

export interface IStoresAxiosResponse extends IAxiosResponse {
    data: IStoreResponse
}

export interface IStoreAxiosResponse extends IAxiosResponse {
    data: IStore
}

export interface IStoreReportTableData {
    id: number | string;
    name: string;
    unitOfMeasure: string;
    quantity: number;
    branch: string;
    status: string;
}

/**
 * Show issuance report
 */

export interface IIssuance {
    id: string | number,
    comment?: string | null,
    requester: IUser
    issuer?: IUser | null
    status?: IStatus | null
    createDate: string,
    lastModified: string,
    createdBy: string,
    lastModifiedBy: string
}

export interface IIssuedCommodity {
    id: number;
    issuance: IIssuance;
    commodity: ICommodity;
    quantity: number;
}

/** `null` data when the commodity has never been issued — the endpoint answers 200 either way. */
export interface ILastIssuedCommodity extends IAxiosResponse {
    data: IIssuedCommodity | null
}
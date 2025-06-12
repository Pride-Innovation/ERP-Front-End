
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


export interface IStore {
    id?: number | string;
    quantity: number;
    commodity: ICommodity;
    branch: IBranch

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

interface IIssuance {
    id: string | number,
    comment: string,
    requester: IUser
    status: IStatus
    createDate: string,
    lastModified: string,
    createdBy: string,
    lastModifiedBy: string
}

export interface ILastIssuedCommodity extends IAxiosResponse {
    data: {
        id: number;
        issuance: IIssuance;
        commodity: ICommodity;
        quantity: number
    }
}
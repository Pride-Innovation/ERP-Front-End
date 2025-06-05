
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IAxiosResponse, IFetchDataRequest } from "../../core/apis/interface";
import { IBranch } from "../settings/branch/interface";
import { ICommodity } from "../settings/commodity/interface";


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
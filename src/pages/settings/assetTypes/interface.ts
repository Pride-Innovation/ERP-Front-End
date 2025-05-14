/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import { IAxiosResponse, IFetchDataRequest } from "../../../core/apis/interface";

export interface IAssetType {
    id: string | number;
    name: string;
    description: string;
}


export interface IAssetTypeResponse extends IFetchDataRequest {
    content: Array<IAssetType>
}

export interface IAssetTypesAxiosResponse extends IAxiosResponse {
    data: IAssetTypeResponse
}

export interface IAssetTypeAxiosResponse extends IAxiosResponse {
    data: IAssetType
}
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import { Dispatch, SetStateAction } from "react";
import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";
import { IAxiosResponse, IFetchDataRequest } from "../../../core/apis/interface";
import { IAssetType } from "../assetTypes/interface";

export interface ICommodity {
    id?: string | number;
    name: string
    groupName: string;
    assetType?: IAssetType | null
}

export interface ICommodityForm {
    formState: FormState<ICommodity> & {
        errors: {
            name?: FieldError;
            groupName?: FieldError;
        };
    };
    control: Control<ICommodity>;
    register: UseFormRegister<ICommodity>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
    update?: boolean;
}

export interface ICreateCommodity {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
}

export interface IUpdateCommodity {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
    commodity: ICommodity
}

export interface ICommodityDetails {
    commodity: ICommodity;
    deleteCommodity: (role: ICommodity) => void;
    updateCommodity: (role: ICommodity) => void;
}

export interface IDeleteCommodity {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
    buttonText: string;
    commodity: ICommodity
}

export interface ICommodityResponse extends IFetchDataRequest {
    content: Array<ICommodity>
}

export interface ICommoditiesAxiosResponse extends IAxiosResponse {
    data: ICommodityResponse
}

export interface ICommodityAxiosResponse extends IAxiosResponse {
    data: ICommodity
}
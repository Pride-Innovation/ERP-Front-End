/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import { Dispatch, SetStateAction } from "react";
import { Control, FormState, UseFormRegister } from "react-hook-form";
import { IAxiosResponse, IFetchDataRequest } from "../../../core/apis/interface";
import { IAssetType } from "../assetTypes/interface";
import { ISupplier } from "../suppliers/interface";

export interface ICommodity {
    id?: string | number;
    name: string;
    groupName: string;
    assetType?: IAssetType | null;
    suppliers?: ISupplier[];
}

export interface ICommodityFormValues {
    id?: string | number;
    name: string;
    groupName: string;
    assetType: number;
}

export interface ICommodityForm {
    formState: FormState<ICommodityFormValues>;
    control: Control<ICommodityFormValues>;
    register: UseFormRegister<ICommodityFormValues>;
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
    /** Position in the rendered grid — used to rotate the card accent colour. */
    index?: number;
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
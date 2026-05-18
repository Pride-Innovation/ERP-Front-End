/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import { Dispatch, SetStateAction } from "react";
import { Control, FormState, UseFormRegister } from "react-hook-form";
import { IFetchDataRequest } from "../../../core/apis/interface";

export type FieldConfigState = 'required' | 'optional' | 'hidden';

/** Maps every configurable form field to its visibility/requirement state for this asset type. */
export interface IAssetFieldConfig {
    // Identification
    assetName?: FieldConfigState;
    engravedNumber?: FieldConfigState;
    hostname?: FieldConfigState;
    make?: FieldConfigState;
    model?: FieldConfigState;
    serialNumber?: FieldConfigState;
    // Classification
    category?: FieldConfigState;
    unitOfMeasure?: FieldConfigState;
    // Financial
    purchaseCost?: FieldConfigState;
    costOfTheAsset?: FieldConfigState;
    netValueB?: FieldConfigState;
    detailNetBookValue?: FieldConfigState;
    assetDepreciationRate?: FieldConfigState;
    // Dates & References
    dateReceipt?: FieldConfigState;
    lpoNumber?: FieldConfigState;
    // Assignment
    assignedTo?: FieldConfigState;
    branch?: FieldConfigState;
    supplier?: FieldConfigState;
    commodity?: FieldConfigState;
    // Technical (IT / network)
    ram?: FieldConfigState;
    cpuSpeed?: FieldConfigState;
    hardDiskSize?: FieldConfigState;
    macAddress?: FieldConfigState;
    ipAddress?: FieldConfigState;
    interfaceType?: FieldConfigState;
    // Other
    description?: FieldConfigState;
    image?: FieldConfigState;
    lastRepairedBy?: FieldConfigState;
}

export interface IAssetType {
    id?: string | number;
    name: string;
    description?: string | null;
    shortCode?: string | null;
    fieldConfig?: IAssetFieldConfig | null;
}

export interface IAssetTypeFormValues {
    name: string;
    description?: string | null;
    shortCode?: string | null;
}

export interface IAssetTypeForm {
    formState: FormState<IAssetTypeFormValues>;
    control: Control<IAssetTypeFormValues>;
    register: UseFormRegister<IAssetTypeFormValues>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
}

export interface ICreateAssetType {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
}

export interface IUpdateAssetType {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    assetType: IAssetType;
}

export interface IDeleteAssetType {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    buttonText: string;
    assetType: IAssetType;
}

export interface IAssetTypeResponse extends IFetchDataRequest {
    content: Array<IAssetType>;
}

export interface IAssetTypesAxiosResponse {
    status: number;
    data: IAssetTypeResponse;
}

export interface IAssetTypeAxiosResponse {
    status: number;
    data: IAssetType;
}

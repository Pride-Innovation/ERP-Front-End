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

export type CustomAttributeDataType = 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'SELECT';

/** A per-category configurable attribute (e.g. "Warranty Period" for IT Equipment only). */
export interface ICustomAttribute {
    id?: string | number;
    key: string;
    label: string;
    dataType: CustomAttributeDataType;
    options?: string[] | null;
    required: boolean;
    order: number;
    helperText?: string | null;
}

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
    accumulatedDepreciation?: FieldConfigState;
    annualDepreciation?: FieldConfigState;
    monthlyDepreciation?: FieldConfigState;
    disposalStatus?: FieldConfigState;
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
    /** Email group notified when a request for this category reaches the fulfilment step (e.g. IT Infrastructure for Computer, Admin for Furniture). */
    ownerGroupEmail?: string | null;
    /** Annual reducing-balance depreciation rate (percent) for assets of this category. */
    depreciationRate?: number | null;
    /** Useful life in months; an asset is flagged for disposal once its age reaches this. */
    usefulLifeMonths?: number | null;
    fieldConfig?: IAssetFieldConfig | null;
    customAttributes?: ICustomAttribute[] | null;
}

export interface IAssetTypeFormValues {
    name: string;
    description?: string | null;
    shortCode?: string | null;
    ownerGroupEmail?: string | null;
    /** Annual reducing-balance depreciation rate (percent). Held as a string in the form input. */
    depreciationRate?: string | null;
    /** Useful life in months. Held as a string in the form input. */
    usefulLifeMonths?: string | null;
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

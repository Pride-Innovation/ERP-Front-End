/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Control,
    FieldError,
    FormState,
    UseFormRegister,
    UseFormTrigger
} from "react-hook-form";
import { ISupplier } from "../../settings/suppliers/interface";
import { IUser } from "../../users/interface";
import { IBranch } from "../../settings/branch/interface";
import { IStatus } from "../../settings/statuses/interface";
import { IAssetType } from "../../settings/assetTypes/interface";
import { IAxiosResponse, IFetchDataRequest } from "../../../core/apis/interface";
import { ICommodity } from "../../settings/commodity/interface";
import { IInventory } from "../../inventory/interface";

export interface IFleet {
    id?: string | number;
    assetName: string;
    hostname?: string | null;
    detailNetBookValue?: string | null;
    engravedNumber: string;
    dateReceipt: string;
    make?: string | null;
    supplier?: ISupplier | null;
    unitOfMeasure: string;
    purchaseCost: string;
    costOfTheAsset: string;
    netValueB?: string | null;
    assignedTo?: IUser | null;
    branch?: IBranch | null;
    assetDepreciationRate?: string | null;
    description?: string | null;
    model?: string | null;
    image?: string | null;
    assetStatus?: IStatus | null;
    assetType?: IAssetType | null;
    category?: string | null
    lpoNumber: string;
    commodity?: ICommodity | null;
    stock?: IInventory | null;
    serialNumber?: string | null;
}


export interface IFleetForm {
    formState: FormState<IFleet> & {
        errors: {
            name?: FieldError;
            assetName?: FieldError;
            hostname?: FieldError;
            detailNetBookValue?: FieldError;
            engravedNumber?: FieldError;
            dateReceipt?: FieldError;
            make?: FieldError;
            unitOfMeasure?: FieldError;
            purchaseCost?: FieldError;
            costOfTheAsset?: FieldError;
            netValueB?: FieldError,
            assetDepreciationRate?: FieldError;
            description?: FieldError;
            image?: FieldError;
            category?: FieldError;
        };
    };
    control: Control<IFleet>;
    register: UseFormRegister<IFleet>;
    buttonText: string;
    sendingRequest: boolean;
    lpoParams?: Record<string, any>
    userParams?: Record<string, any>
    supplierParams?: Record<string, any>
    branchParams?: Record<string, any>


    // New properties for stepped form
    formFields?: any;
    computerFields?: any;
    categories?: Record<string, string>;
    selectedCategory?: string;
    stateFormFields?: any;
    isUpdate?: boolean;
    loading?: boolean;
    trigger?: UseFormTrigger<IFleet>;
}

export interface IFleetTableData {
    assetName: string;
    engravedNumber?: string | null;
    dateReceived: string;
    make: string | null;
    purchaseCost?: string;
    costOfAsset?: string;
    model?: string;
    status: string;
    assignedTo: string;
    location: string;
    manufacturer?: string;
}

export interface IFleetResponse extends IFetchDataRequest {
    content: Array<IFleet>
}

export interface IFleetsAxiosResponse extends IAxiosResponse {
    data: IFleetResponse
}

export interface IFleetAxiosResponse extends IAxiosResponse {
    data: IFleet
}
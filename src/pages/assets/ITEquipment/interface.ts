/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { SelectChangeEvent } from "@mui/material";
import { Control, FieldError, FormState, UseFormRegister, UseFormTrigger } from "react-hook-form";
import { IAssetType } from "../../settings/assetTypes/interface";
import { IBranch } from "../../settings/branch/interface";
import { IUser } from "../../users/interface";
import { ISupplier } from "../../settings/suppliers/interface";
import { IStatus } from "../../settings/statuses/interface";
import { IAxiosResponse, IFetchDataRequest } from "../../../core/apis/interface";
import { ICommodity } from "../../settings/commodity/interface";
import { IInventory } from "../../inventory/interface";
import { IOptions } from "../../../components/tables/interface";
import { ReactNode } from "react";

/**
 * Interface for IT Equipment data model
 */
export interface IITEquipment {
    id?: string | number;
    assetName: string;
    hostname?: string | null;
    detailNetBookValue?: string | null;
    engravedNumber: string;
    dateReceipt: string;
    make: string;
    supplier?: ISupplier | null;
    unitOfMeasure: string;
    purchaseCost: string;
    costOfTheAsset: string;
    netValueB?: string | null;
    model?: string | null;
    serialNumber?: string | null;
    assignedTo?: IUser | null;
    branch?: IBranch | null;
    ram?: string | null;
    cpuSpeed?: string | null;
    hardDiskSize?: string | null;
    macAddress?: string | null;
    ipAddress?: string | null;
    interfaceType?: string | null;
    assetDepreciationRate?: string | null;
    description?: string | null;
    image?: string | null;
    assetStatus?: IStatus | null;
    assetType?: IAssetType | null;
    category?: string | null;
    lpoNumber: string;
    commodity?: ICommodity | null;
    stock?: IInventory | null
}

/**
 * Interface for form field definition
 */
export interface IFormData<T> {
    value: keyof T | string;
    label: string;
    type: 'input' | 'select' | 'date' | 'number' | 'textarea' | 'autocomplete';
    options?: Array<IOptions> | any;
    required?: boolean;
    disabled?: boolean;
    icon?: ReactNode;
    section?: 'basic' | 'technical';
}

/**
 * Interface for IT Equipment form component props
 */
export interface IITEquipmentForm {
    formState: FormState<IITEquipment> & {
        errors: {
            assetName?: FieldError
            hostname?: FieldError
            detailNetBookValue?: FieldError;
            engravedNumber?: FieldError;
            dateReceipt?: FieldError;
            make?: FieldError;
            unitOfMeasure?: FieldError;
            purchaseCost?: FieldError;
            costOfTheAsset?: FieldError;
            netValueB?: FieldError;
            model?: FieldError;
            serialNumber?: FieldError;
            ram?: FieldError;
            cpuSpeed?: FieldError;
            hardDiskSize?: FieldError;
            macAddress?: FieldError;
            ipAddress?: FieldError;
            interfaceType?: FieldError;
            assetDepreciationRate?: FieldError;
            desc?: FieldError;
            category?: FieldError;
        };
    };
    control: Control<IITEquipment>;
    register: UseFormRegister<IITEquipment>;
    buttonText: string;
    sendingRequest: boolean;
    option?: string | undefined;
    handleChange?: (event: SelectChangeEvent) => void;
    lpoParams?: Record<string, any>;
    userParams?: Record<string, any>;
    supplierParams?: Record<string, any>;
    branchParams?: Record<string, any>;

    // New properties for stepped form
    formFields?: any;
    computerFields?: any;
    categories?: Record<string, string>;
    selectedCategory?: string;
    stateFormFields?: any;
    isUpdate?: boolean;
    loading?: boolean;
    trigger?: UseFormTrigger<IITEquipment>;

}

/**
 * Interface for asset category
 */
export interface IAsssetCategory {
    id: number;
    name: string;
    status: string;
    desc: string;
    image: any;
    user_id: number;
}

/**
 * Interface for paginated IT Equipment response
 */
export interface IITEquipmentResponse extends IFetchDataRequest {
    content: Array<IITEquipment>;
}

/**
 * Interface for API responses containing multiple IT equipment items
 */
export interface IITEquipmentsAxiosResponse extends IAxiosResponse {
    data: IITEquipmentResponse;
}

/**
 * Interface for API responses containing a single IT equipment item
 */
export interface IITEquipmentAxiosResponse extends IAxiosResponse {
    data: IITEquipment;
}

/**
 * Interface for table data representation of IT Equipment
 */
export interface IITEquipmentTableData {
    assetName: string;
    engravedNumber?: string | null;
    dateReceived: string;
    make?: string | null;
    purchaseCost?: string;
    costOfAsset?: string;
    model?: string;
    serialNumber?: string;
    status: string;
    assignedTo: string;
    location: string;
}

/**
 * Interface for form sections in the stepped form
 */
export interface IFormSection {
    title: string;
    icon: ReactNode;
    fields: Array<IFormData<IITEquipment>>;
}

export interface IBulkAssetData {
    "No.": number;
    "Product Name": string;
    "Asset Tag": string;
    "Asset Serial No.": string;
    "Model": string;
    "USER": string;
    "LOCATION": string;
    "DATE OF PM/Verification": number;
}
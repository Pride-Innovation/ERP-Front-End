/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Dispatch, SetStateAction } from "react";
import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";
import { ICommodity } from "../settings/commodity/interface";
import { IBranch } from "../settings/branch/interface";
import { ISupplier } from "../settings/suppliers/interface";
import { IStatus } from "../settings/statuses/interface";
import { IAxiosResponse, IFetchDataRequest } from "../../core/apis/interface";
import { IUser } from "../users/interface";


export interface IStockCommodities {
    orderedQuantity: number;
    deliveredQuantity: number;
    costPrice: number;
    purchasePrice: number;
    // reorderLevel: string;
    commodity: ICommodity
}

interface IInventory {
    id?: string | number;
    name: string;
    commodities?: Array<IStockCommodities> | null
    referenceNumber?: string | null;
    lpoNumber: string;
    totalCost?: number | null;
    balanceCost?: number | null;
    branch?: IBranch | null;
    status?: IStatus | null;
    deliveryNote?: any | null;
    supplier?: ISupplier | null;
    createDate?: string | null;
    lastModified?: string | null;
    createdBy?: IUser | null;
    lastModifiedBy?: IUser | null;
    grnNumber?: string | null;
    grnReports
    ?: Array<{
        id: string | number;
        name: string;
        documentPath: string;
    }> | null;
}

interface IInventoryTableData {
    name: string
    totalItemsOrdered: number;
    totalItemsDelivered: number;
    branch: string;
    status: string;
    supplier: string;
    date: string;
}

interface IDeleteInventory {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    buttonText: string;
}

interface IInventoryForm {
    formState: FormState<IInventory> & {
        errors: {
            name?: FieldError;
            referenceNumber?: FieldError;
            LPONumber?: FieldError;
        };
    };
    control: Control<IInventory>;
    register: UseFormRegister<IInventory>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
}


interface IInventoryResponse extends IFetchDataRequest {
    content: Array<IInventory>
}

interface IInventoriesAxiosResponse extends IAxiosResponse {
    data: IInventoryResponse
}

interface IInventoryAxiosResponse extends IAxiosResponse {
    data: IInventory
}


interface IGRNCommodity {
    id?: string | number;
    grnReport?: IGRNReport | null;
    commodity?: ICommodity | null;
    deliveredQuantity: number;
    costPrice?: number | null;
    purchasePrice?: number | null;
}

interface IGRNCommodityResponse extends IFetchDataRequest {
    content: Array<IGRNCommodity>
}

interface IGRNCommoditiesAxiosResponse extends IAxiosResponse {
    data: IGRNCommodityResponse
}

interface IDeleteInventoryResponse extends IAxiosResponse {
    data: {
        message: string;
        success: boolean;
    }
}

interface IGRNReport {
    id: string | number;
    name: string;
    documentPath: string;
    createDate: string | null;
    lastModified: string | null;
    createdBy: IUser | null;
    lastModifiedBy: IUser | null;
}

interface IGRNUploadResponse extends IAxiosResponse {
    data: IGRNReport
}


interface IInventoryDetailsTableData {
    id: string | number,
    name: string
    orderedQuantity: number;
    deliveredQuantity: number;
    costPrice: number;
    purchasePrice: number;
}

interface IGRNReportTableData {
    grnNumber: string;
    createDate: string;
    lastModified: string;
    grnUploaded?: string;
}


export type {
    IInventory,
    IInventoryForm,
    IDeleteInventory,
    IInventoryTableData,
    IInventoriesAxiosResponse,
    IInventoryAxiosResponse,
    IInventoryDetailsTableData,
    IGRNUploadResponse,
    IGRNReport,
    IGRNReportTableData,
    IGRNCommoditiesAxiosResponse,
    IGRNCommodity,
    IDeleteInventoryResponse
}
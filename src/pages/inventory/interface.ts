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


interface IStockCommodities {
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
    stockCommodities?: Array<IStockCommodities> | null
    referenceNumber: string;
    totalCost?: number | null;
    balanceCost?: number | null;
    branch?: IBranch | null;
    status?: IStatus | null;
    deliveryNote?: any | null
    // costPrice: string;
    // purchasePrice: string
    supplier?: ISupplier | null
    // description?: string
    // expirationDate: string
}

interface IInventoryTableData {
    name: string
    referenceNumber: string;
    totalCost: number;
    balanceCost: number;
    branch: string;
    status: string;
    supplier: string;
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
        };
    };
    control: Control<IInventory>;
    register: UseFormRegister<IInventory>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
}

export type {
    IInventory,
    IInventoryForm,
    IDeleteInventory,
    IInventoryTableData
}
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Dispatch, SetStateAction } from "react";
import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";

interface IInventory {
    id?: string | number;
    name: string;
    quantityInStock: number;
    unitOfMeasure: string;
    location: string;
    category: string;
    reorderLevel: string;
    costPrice: string;
    purchasePrice: string
    supplier: string
    description: string
    expirationDate: string
}

interface ICreateInventory {
    handleClose: () => void;
}

interface IUpdateInventory {
    handleClose: () => void;
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
            quantityInStock?: FieldError;
            unitOfMeasure?: FieldError;
            location?: FieldError;
            category?: FieldError;
            reorderLevel?: FieldError;
            costPrice?: FieldError;
            purchasePrice?: FieldError;
            supplier?: FieldError;
            description?: FieldError;
            expirationDate?: FieldError;
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
    ICreateInventory,
    IInventoryForm,
    IUpdateInventory,
    IDeleteInventory
}
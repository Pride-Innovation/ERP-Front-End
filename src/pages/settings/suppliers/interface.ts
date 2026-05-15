/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Dispatch, SetStateAction } from "react";
import {
    Control,
    FormState,
    UseFormRegister
} from "react-hook-form";
import { IAxiosResponse, IFetchDataRequest } from "../../../core/apis/interface";
import { ICommodity } from "../commodity/interface";

export interface ISupplier {
    id?: string | number;
    name: string;
    telephone: string;
    email: string;
    address?: string | null;
    commodities?: Array<ICommodity | number>;
}

export interface ISupplierFormValues {
    id?: string | number;
    name: string;
    telephone: string;
    email: string;
    address?: string | null;
    commodities?: number[] | null;
}

export interface ISupplierDetails {
    supplier: ISupplier;
    deleteSupplier: (supplier: ISupplier) => void;
    updateSupplier: (supplier: ISupplier) => void;
}

export interface ICreateSupplier {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
}

export interface IUpdateSupplier {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    supplier: ISupplier;
}

export interface IDeleteSupplier {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    buttonText: string;
    supplier: ISupplier;
}

export interface ISupplierForm {
    formState: FormState<ISupplierFormValues>;
    control: Control<ISupplierFormValues>;
    register: UseFormRegister<ISupplierFormValues>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
}

export interface ISupplierResponse extends IFetchDataRequest {
    content: Array<ISupplier>;
}

export interface ISuppliersAxiosResponse extends IAxiosResponse {
    data: ISupplierResponse;
}

export interface ISupplierAxiosResponse extends IAxiosResponse {
    data: ISupplier;
}


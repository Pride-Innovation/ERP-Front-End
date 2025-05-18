/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Dispatch, SetStateAction } from "react";
import {
    Control,
    FieldError,
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
    commodity?: ICommodity | null
}

interface ISupplierDetails {
    supplier: ISupplier;
    deleteSupplier: (role: ISupplier) => void;
    updateSupplier: (role: ISupplier) => void;
}

interface ICreateSupplier {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
}

interface IUpdateSupplier {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    supplier: ISupplier
}

interface IDeleteSupplier {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    buttonText: string;
    supplier: ISupplier
}

interface ISupplierForm {
    formState: FormState<ISupplier> & {
        errors: {
            name?: FieldError;
            email?: FieldError;
            tel?: FieldError;
            desc?: FieldError;
            status?: FieldError;
        };
    };
    control: Control<ISupplier>;
    register: UseFormRegister<ISupplier>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
}

interface ISupplierResponse extends IFetchDataRequest {
    content: Array<ISupplier>
}

interface ISuppliersAxiosResponse extends IAxiosResponse {
    data: ISupplierResponse
}

interface ISupplierAxiosResponse extends IAxiosResponse {
    data: ISupplier
}

export type {
    ISupplierDetails,
    ISupplierForm,
    ICreateSupplier,
    IUpdateSupplier,
    IDeleteSupplier,
    ISupplierAxiosResponse,
    ISupplierResponse,
    ISuppliersAxiosResponse
}
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Control, FormState, UseFormRegister } from "react-hook-form";
import { IUser } from "../../users/interface";
import { Dispatch, SetStateAction } from "react";
import { IAxiosResponse, IFetchDataRequest } from "../../../core/apis/interface";
import { IBranch } from "../branch/interface";

interface IDepartment {
    id?: string | number;
    name: string;
    headOfDepartment?: IUser | null;
    branch?: IBranch | null;
    managersGroupEmail?: string | null;
    shortCode?: string | null;
}

interface IDepartmentFormValues {
    name: string;
    headOfDepartment: number;
    branch: number;
    managersGroupEmail?: string | null;
}

interface IDepartmentDetails {
    department: IDepartment;
    deleteDepartment: (role: IDepartment) => void;
    updateDepartment: (role: IDepartment) => void;
    /** Position in the rendered grid — used to rotate the card accent colour. */
    index?: number;
}


interface IDepartmentForm {
    formState: FormState<IDepartmentFormValues>;
    control: Control<IDepartmentFormValues>;
    register: UseFormRegister<IDepartmentFormValues>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
}

interface ICreateDepartment {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
}

interface IUpdateDepartment {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    department: IDepartment
}

export interface IDeleteDepartment {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    buttonText: string;
    department: IDepartment
}


interface IDepartmentResponse extends IFetchDataRequest {
    content: Array<IDepartment>
}

interface IDepartmentsAxiosResponse extends IAxiosResponse {
    data: IDepartmentResponse
}

interface IDepartmentAxiosResponse extends IAxiosResponse {
    data: IDepartment
}

export type {
    IDepartment,
    IDepartmentFormValues,
    IDepartmentDetails,
    IDepartmentForm,
    ICreateDepartment,
    IUpdateDepartment,
    IDepartmentResponse,
    IDepartmentsAxiosResponse,
    IDepartmentAxiosResponse
}
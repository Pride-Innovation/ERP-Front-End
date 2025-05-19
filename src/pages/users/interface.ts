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
    UseFormRegister
} from "react-hook-form";
import { IAxiosResponse, IFetchDataRequest } from "../../core/apis/interface";
import { ITitle } from "../settings/titles/interface";
import { IBranch } from "../settings/branch/interface";
import { IDepartment } from "../settings/departments/interface";

export interface IUser {
    id?: string | number;
    firstName: string;
    lastName: string;
    otherName?: string | null;
    email: string;
    title?: ITitle | null;
    profileImage?: any | null;
    staffNumber: string;
    gender: string;
    password?: string | null;
    available?: boolean | null;
    branch?: IBranch | null;
    department?: IDepartment | null
    isEnabled?: boolean | null;
    lastModifiedBy?: IUser | null
    createdBy?: IUser | null
    createDate?: string | null
    lastModified?: string | null
}

export interface IUserTableData {
    image: any,
    name: string;
    staffNumber: string;
    title: string;
    dutyStation: string;
    email: string;
    gender: string;
}


export interface ICreateUser {
    handleClose: () => void;
}

export interface IUpdateUser {
    handleClose: () => void;
}

export interface IDeactivate {
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string;
    user: IUser;
    handleDeactivate?: (id: string | number) => void
}

export interface IResponseData {

    status: "success" | "failed",
    data: {
        "0"?: IUser,
        message: string;
    }
}

export interface IUserForm {
    formState: FormState<IUser> & {
        errors: {
            email?: FieldError;
            firstName?: FieldError;
            lastName?: FieldError;
            otherName?: FieldError;
            gender?: FieldError;
            staffNumber?: FieldError;
        };
    };
    control: Control<IUser>;
    register: UseFormRegister<IUser>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
}


export interface IUserResponse extends IFetchDataRequest {
    content: Array<IUser>
}

export interface IBranchesAxiosResponse extends IAxiosResponse {
    data: IUserResponse
}

export interface IBranchAxiosResponse extends IAxiosResponse {
    data: IUser
}
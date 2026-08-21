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
import { IRole } from "../settings/interface";
import { IDepartment } from "../settings/departments/interface";
import { Dispatch, SetStateAction } from "react";

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
    availability?: string | null;
    branch?: IBranch | null;
    department?: IDepartment | null
    /** Optional unit (Head Office). Carries the id when set from the form, or the summary object from the API. */
    unit?: { id: number; name: string; groupEmail?: string | null } | number | null;
    enabled?: boolean | null;
    /** Audit columns — the API returns the actor's user id, not the user object. */
    lastModifiedBy?: number | null
    createdBy?: number | null
    createDate?: string | null
    lastModified?: string | null
    accountNonLocked?: boolean | null;
    blocked?: boolean | null;
    /**
     * Roles granted on top of the one the title carries.
     *
     * Effective permissions are `title.role.permissions` united with these, which is how one person
     * holds several capabilities at once. The login response omitted them until now, so the browser
     * only ever saw the first half and every permission granted this way was invisible to every
     * guard in the app.
     */
    additionalRoles?: Array<IRole> | null;
}

export interface IUserTableData {
    image: any,
    name: string;
    staffNumber: string;
    title: string;
    dutyStation: string;
    email: string;
    gender: string;
    status: string;
}


export interface ICreateUser {
    handleClose: () => void;
}

export interface IUpdateUser {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
    user: IUser
}

export interface IDisable {
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string;
    user: IUser;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
}

export interface IUnBolock {
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string;
    user: IUser;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
}

export interface IEnable {
    user: IUser;
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: React.Dispatch<SetStateAction<boolean>>;
    buttonText?: string;
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
    mode?: 'create' | 'update';
}


export interface IUserResponse extends IFetchDataRequest {
    content: Array<IUser>
}

export interface IUsersAxiosResponse extends IAxiosResponse {
    data: IUserResponse
}

interface IUserCreationResponse {
    user: IUser;
    response: {
        status: string;
        message: string;
    }
}

export interface IUserAxiosResponse extends IAxiosResponse {
    data: IUser
}

export interface IUserCreationResponseAxiosResponse extends IAxiosResponse {
    data: IUserCreationResponse
}

/**
 * Shape of one row after the import template has been parsed and the header
 * names have been camel-cased by the upload handler. Mirrors the backend
 * `BulkUserDTO` and the column order in `userImportTemplate.ts`.
 */
export interface IBulkUserData {
    no?: number;
    firstName: string;
    lastName: string;
    otherName?: string;
    email: string;
    staffNumber: string;
    gender: string;
    title: string;
    role?: string;
    dutyStation: string;
    department?: string;
}
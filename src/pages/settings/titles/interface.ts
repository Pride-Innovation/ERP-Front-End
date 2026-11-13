/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";
import { IAxiosResponse, IFetchDataRequest } from "../../../core/apis/interface";
import { Dispatch, SetStateAction } from "react";
import { IRole } from "../interface";
import { IBranch } from "../branch/interface";
import { TitleWorkplace } from "./classification";

export interface ITitle {
    id?: string | number;
    name: string;
    shortCode?: string;
    reportsTo?: ITitle | null;
    role?: IRole | null;
    branch?: IBranch | null
    /** For filtering only. Null or absent = not set. */
    workplace?: TitleWorkplace | null;
    /** For filtering only; the server sends the department without its branch. */
    department?: { id: number; name: string; shortCode?: string } | null;
    /** Form-only: the department picker's value, sent as `departmentId`. */
    departmentId?: number | null;
    /** Only one active holder per location (a branch, or Head Office). */
    singleHolder?: boolean;
}

export interface ITitleDetails {
    title: ITitle;
    deleteTitle: (role: ITitle) => void;
    updateTitle: (role: ITitle) => void;
    /** Position in the rendered grid — used to rotate the card accent colour. */
    index?: number;
}


export interface ITitleOption {
    value: number;
    label: string;
}

export interface ITitleForm {
    formState: FormState<ITitle> & {
        errors: {
            name?: FieldError;
        };
    };
    control: Control<ITitle>;
    register: UseFormRegister<ITitle>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
    update?: boolean;
    /** Pre-populated option for the "Reports To" picker when editing an existing title. */
    initialReportsTo?: ITitleOption | null;
}

export interface ICreateTitle {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
}

export interface IUpdateTitle {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
    title: ITitle
}


export interface IDeleteTitle {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
    buttonText: string;
    title: ITitle
}

export interface ITitleResponse extends IFetchDataRequest {
    content: Array<ITitle>
}

export interface ITitlesAxiosResponse extends IAxiosResponse {
    data: ITitleResponse
}

export interface ITitleAxiosResponse extends IAxiosResponse {
    data: ITitle
}
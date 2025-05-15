/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";
import { IAxiosResponse, IFetchDataRequest } from "../../../core/apis/interface";
import { Dispatch, SetStateAction } from "react";

export interface ITitle {
    id?: string | number;
    name: string;
    reportsTo?: ITitle | null
}

export interface ITitleDetails {
    title: ITitle;
    deleteTitle: (role: ITitle) => void;
    updateTitle: (role: ITitle) => void;
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

export interface ITitleResponse extends IFetchDataRequest {
    content: Array<ITitle>
}

export interface ITitlesAxiosResponse extends IAxiosResponse {
    data: ITitleResponse
}

export interface ITitleAxiosResponse extends IAxiosResponse {
    data: ITitle
}
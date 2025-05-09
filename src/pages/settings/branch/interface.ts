/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";
import { Dispatch, SetStateAction } from "react";

export interface IBranch {
    id?: string | number;
    name: string
    email: string
    tel?: string | null
    desc?: string | null
    status?: string | null,
    user_id?: number | null,
    image?: any | null
}


export interface IBranchForm {
    formState: FormState<IBranch> & {
        errors: {
            name?: FieldError;
            email?: FieldError;
            tel?: FieldError;
            desc?: FieldError;
            status?: FieldError;
        };
    };
    control: Control<IBranch>;
    register: UseFormRegister<IBranch>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
    update?: boolean;
}

export interface ICreateBranch {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
}

export interface IUpdateBranch {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
    branch: IBranch
}

export interface IBranchDetails {
    branch: IBranch;
    deleteBranch: (role: IBranch) => void;
    updateBranch: (role: IBranch) => void;
}

export interface IDeleteBranch {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
    buttonText: string;
    branch: IBranch
}
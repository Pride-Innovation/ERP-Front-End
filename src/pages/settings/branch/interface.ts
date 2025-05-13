/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";
import { Dispatch, SetStateAction } from "react";
import { IUser } from "../../users/interface";
import { IAxiosResponse, IFetchDataRequest } from "../../../core/apis/interface";

export interface IRegion {
    id?: string | number;
    name: string;
}

export interface IDistrict {
    id?: string | number;
    name: string;
}

export interface IBranch {
    id?: string | number;
    name: string
    email: string
    telephone?: string | null;
    branchManager?: IUser;
    branchOperationsManager?: IUser;
    relationshipManager?: IUser;
    creditAdministrator?: IUser;
    region?: IRegion;
    district?: IDistrict;
}

export interface IBranchForm {
    formState: FormState<IBranch> & {
        errors: {
            name?: FieldError;
            email?: FieldError;
            telephone?: FieldError;
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

export interface IBranchResponse extends IFetchDataRequest {
    content: Array<IBranch>
}

export interface IBranchesAxiosResponse extends IAxiosResponse {
    data: IBranchResponse
}

export interface IBranchAxiosResponse extends IAxiosResponse {
    data: IBranch
}
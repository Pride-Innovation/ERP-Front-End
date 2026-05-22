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

/** Response shape from list (GET /branches) and single get (GET /branches/:id) */
export interface IBranch {
    id?: string | number;
    name: string
    email: string
    telephone?: string | null;
    /** Flagged by the backend seeder; drives the Head-Office-only Department picker on the User form. */
    isHeadOffice?: boolean;
    branchManager?: IUser | null;
    branchOperationsManager?: IUser | null;
    relationshipManager?: IUser | null;
    creditAdministrator?: IUser | null;
    region?: IRegion | null;
    district?: IDistrict | null;
}

/** Request body shape for create (POST) and update (PUT) — managers/region/district are IDs */
export interface IBranchDTO {
    name: string;
    email: string;
    telephone: string;
    region: number;
    district: number;
    branchManager?: number | null;
    branchOperationsManager?: number | null;
    relationshipManager?: number | null;
    creditAdministrator?: number | null;
}

/** Response shape from create (POST) and update (PUT) — Branch entity without manager objects */
export interface IBranchEntity {
    id: number;
    name: string;
    email: string;
    telephone?: string | null;
    shortCode?: string | null;
    region?: IRegion | null;
    district?: IDistrict | null;
}

export interface IBranchForm {
    formState: FormState<IBranchDTO> & {
        errors: {
            name?: FieldError;
            email?: FieldError;
            telephone?: FieldError;
            region?: FieldError;
            district?: FieldError;
        };
    };
    control: Control<IBranchDTO>;
    register: UseFormRegister<IBranchDTO>;
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

/** Axios response wrapping the enriched BranchWithManagersDTO (single get) */
export interface IBranchAxiosResponse extends IAxiosResponse {
    data: IBranch
}

/** Axios response wrapping the Branch entity returned by create and update */
export interface IBranchEntityAxiosResponse extends IAxiosResponse {
    data: IBranchEntity
}
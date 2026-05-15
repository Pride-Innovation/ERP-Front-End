/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Control, FormState, UseFormRegister } from "react-hook-form";
import { IAxiosResponse, IFetchDataRequest } from "../../../core/apis/interface";
import { Dispatch, SetStateAction } from "react";

export interface IRegion {
    id?: string | number;
    name: string;
}

export interface IRegionFormValues {
    name: string;
}

export interface IRegionDetails {
    region: IRegion;
    deleteRegion: (role: IRegion) => void;
    updateRegion: (role: IRegion) => void;
}


export interface IRegionForm {
    formState: FormState<IRegionFormValues>;
    control: Control<IRegionFormValues>;
    register: UseFormRegister<IRegionFormValues>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
}

export interface ICreateRegion {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
}

export interface IUpdateRegion {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    region: IRegion
}

export interface IDeleteRegion {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    buttonText: string;
    region: IRegion
}


export interface IRegionResponse extends IFetchDataRequest {
    content: Array<IRegion>
}

export interface IRegionsAxiosResponse extends IAxiosResponse {
    data: IRegionResponse
}

export interface IRegionAxiosResponse extends IAxiosResponse {
    data: IRegion
}
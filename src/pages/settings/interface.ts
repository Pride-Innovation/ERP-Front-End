/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Control, FormState, UseFormRegister } from "react-hook-form";
import { IAxiosResponse, IFetchDataRequest } from "../../core/apis/interface";

export interface IPermission {
    id?: number | string;
    name: string;
    index?: number;
}


export interface IRole {
    id?: string | number;
    name: string;
    description?: string | null;
    permissions?: Array<IPermission>;
}

export interface IRoleFormValues {
    name: string;
    description?: string | null;
}

export interface IModule {
    id: number | string;
    icon: JSX.Element;
    name: string;
}

export interface IRoleRow {
    role: IRole;
    module: IModule;
    allPermissions: IPermission[];
}

export interface IRoleDetails {
    role: IRole;
    deleteRole: (role: IRole) => void;
    updateRole: (role: IRole) => void;
    allPermissions: IPermission[];
}

export interface IDeleteRole {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: (val: boolean) => void;
    buttonText: string;
    role: IRole;
}

export interface ICreateRole {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: (val: boolean) => void;
}

export interface IUpdateRole {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: (val: boolean) => void;
    role: IRole;
}

export interface IRoleForm {
    formState: FormState<IRoleFormValues>;
    control: Control<IRoleFormValues>;
    register: UseFormRegister<IRoleFormValues>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
}

export interface ISettingsNavigation {
    id: number;
    text: string;
    path: string;
    icon: JSX.Element;
}

export interface IRoleResponse extends IFetchDataRequest {
    content: Array<IRole>
}

export interface IRolesAxiosResponse {
    status: number;
    data: IRoleResponse;
}

export interface IRoleAxiosResponse {
    status: number;
    data: IRole;
}

export interface IPermissionsAxiosResponse {
    status: number;
    data: IPermission[];
}
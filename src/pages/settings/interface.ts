import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";

export interface IPermission {
    id?: number | string;
    name: string;
    guard_name?: string;
}


export interface IRole {
    id?: string | number;
    name: string;
    permissions?: Array<IPermission>;
    guard_name?: string;
}


export interface IModule {
    id: number | string;
    icon: JSX.Element;
    name: string;
}

export interface IRoleRow {
    role: IRole
    module: IModule
}

export interface IRoleDetails {
    role: IRole;
    deleteRole: (role: IRole) => void;
    updateRole: (role: IRole) => void;
}

export interface IDeleteRole {
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string;
    role: IRole
}

export interface ICreateRole {
    handleClose: () => void;
    sendingRequest: boolean;
}

export interface IUpdateRole {
    handleClose: () => void;
    sendingRequest: boolean;
    role: IRole
}

export interface IRoleForm {
    formState: FormState<IRole> & {
        errors: {
            name?: FieldError;
        };
    };
    control: Control<IRole>;
    register: UseFormRegister<IRole>;
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
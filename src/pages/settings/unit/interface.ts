/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";
import { IUser } from "../../users/interface"
import { Dispatch, SetStateAction } from "react";
import { IDepartment } from "../departments/interface";

interface IUnit {
    id?: number | string;
    name: string;
    department_id: number;
    status?: number | null;
    desc?: string | null;
    user?: Array<IUser> | null;
    department?: IDepartment | null;
    head?: string | null;
    image?: string | null;
}

interface IUnitDetails {
    unit: IUnit;
    deleteUnit: (role: IUnit) => void;
    updateUnit: (role: IUnit) => void;
}

interface IUnitForm {
    formState: FormState<IUnit> & {
        errors: {
            name?: FieldError;
            department_id?: FieldError;
            head?: FieldError;
            status?: FieldError;
            desc?: FieldError;
        };
    };
    control: Control<IUnit>;
    register: UseFormRegister<IUnit>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
}

interface ICreateUnit {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
}

interface IUpdateUnit {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    unit: IUnit;
}

export interface IDeleteUnit {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    buttonText: string;
    unit: IUnit
}

export type {
    IUnit,
    IUnitDetails,
    IDepartment,
    ICreateUnit,
    IUnitForm,
    IUpdateUnit
}
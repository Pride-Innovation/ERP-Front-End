import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";
import { IUser } from "../../users/interface";
import { IUnit } from "../unit/interface";
import { Dispatch, SetStateAction } from "react";

interface IDepartment {
    id?: string | number;
    name: string;
    status?: number | null;
    desc?: string | null;
    image?: any | null;
    head?: string | number | IUser | null;
    units?: Array<IUnit> | null
}

interface IDepartmentDetails {
    department: IDepartment;
    deleteDepartment: (role: IDepartment) => void;
    updateDepartment: (role: IDepartment) => void;
}


interface IDepartmentForm {
    formState: FormState<IDepartment> & {
        errors: {
            name?: FieldError;
            email?: FieldError;
            tel?: FieldError;
            desc?: FieldError;
            status?: FieldError;
        };
    };
    control: Control<IDepartment>;
    register: UseFormRegister<IDepartment>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
}

interface ICreateDepartment {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
}

interface IUpdateDepartment {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    department: IDepartment
}

export interface IDeleteDepartment {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    buttonText: string;
    department: IDepartment
}

export type {
    IDepartment,
    IDepartmentDetails,
    IDepartmentForm,
    ICreateDepartment,
    IUpdateDepartment
}
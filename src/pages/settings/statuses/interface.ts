import { Dispatch, SetStateAction } from "react";
import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";

export interface IStatus {
    id?: string | number;
    name: string;
    desc?: string | null;
    status?: string | null;
    image?: any | null;
    user_id?: number | null;
}

export interface IStatusDetails {
    status: IStatus;
    deleteStatus: (role: IStatus) => void;
    updateStatus: (role: IStatus) => void;
}

export interface IStatusForm {
    formState: FormState<IStatus> & {
        errors: {
            name?: FieldError;
            desc?: FieldError;
            status?: FieldError;
        };
    };
    control: Control<IStatus>;
    register: UseFormRegister<IStatus>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
}

export interface ICreateStatus {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
}

export interface IUpdateStatus {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    status: IStatus;
}
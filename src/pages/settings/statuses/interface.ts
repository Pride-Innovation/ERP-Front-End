import { Dispatch, SetStateAction } from "react";
import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";
import { IFetchDataRequest } from "../../../core/apis/interface";

export interface IStatus {
    id?: string | number;
    name: string;
    desc?: string | null;
    status?: string | null;
}

export interface IStatusFetchResponse extends IFetchDataRequest {
    content: Array<IStatus>
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


export interface IDeleteStatus {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    buttonText: string;
    status: IStatus
}
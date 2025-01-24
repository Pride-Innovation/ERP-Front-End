import { Dispatch, SetStateAction } from "react";
import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";

export interface IUnitOfMeasure {
    id?: string | number;
    name: string;
    symbol: string;
    status?: string | null;
    desc?: string | null;
    image?: any | null
    user_id?: number | null;
}

export interface IUnitOfMeasureForm {
    formState: FormState<IUnitOfMeasure> & {
        errors: {
            name?: FieldError;
            symbol?: FieldError;
            desc?: FieldError;
            status?: FieldError;
        };
    };
    control: Control<IUnitOfMeasure>;
    register: UseFormRegister<IUnitOfMeasure>;
    buttonText: string;
    sendingRequest: boolean;
    handleClose: () => void;
}

export interface ICreateUnitOfMeasure {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
}

export interface IUpdateUnitOfMeasure {
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    unitOfMeasure: IUnitOfMeasure;
}

export interface IUnitOfMeasureDetails {
    unitOfMeasure: IUnitOfMeasure;
    deleteUnitOfMeasure: (role: IUnitOfMeasure) => void;
    updateUnitOfMeasure: (role: IUnitOfMeasure) => void;
}

export interface IDeleteUnitOfMeasure {
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string;
    unitOfMeasure: IUnitOfMeasure
}
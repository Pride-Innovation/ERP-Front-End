import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";
import { IUnitOfMeasure } from "../../assets/ITEquipment/interface";


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
}

export interface IUpdateUnitOfMeasure {
    handleClose: () => void;
    sendingRequest: boolean;
    unitOfMeasure: IUnitOfMeasure
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
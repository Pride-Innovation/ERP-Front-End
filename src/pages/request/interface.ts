import {
    Control,
    FieldError,
    FormState,
    UseFormRegister
} from "react-hook-form";
import { IUser } from "../users/interface";

export interface IAssetParticulars {
    name: string;
    serialNumber: string;
    engravedNumber: string;
}

export interface IRequest {
    id?: string | number;
    user?: IUser
    reason: string;
    quantity: number;
    status?: string | null;
    description: string;
    date: string;
}

export interface IRequestTableData {
    department?: string;
    name: string;
    reason: string;
    quantity: number;
    status?: string | null;
    description: string;
    date: string;
}


export interface IRequestForm {
    formState: FormState<IRequest> & {
        errors: {
            officerName?: FieldError;
            title?: FieldError;
            department?: FieldError;
            reason?: FieldError;
            quantity?: FieldError;
            description?: FieldError;
            expectedReturnDate?: FieldError;
        };
    };
    control: Control<IRequest>;
    register: UseFormRegister<IRequest>;
    buttonText: string;
    sendingRequest: boolean;
}

export interface IDeleteRequest {
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string;
    request: IRequest
}
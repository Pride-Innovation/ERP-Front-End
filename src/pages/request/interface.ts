import {
    Control,
    FieldError,
    FormState,
    UseFormRegister
} from "react-hook-form";
import { IUser } from "../users/interface";
import { IPermission } from "../settings/interface";

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

export interface IRequestDetails {
    open: boolean;
    handleClose: () => void;
    data: IRequest
}

export interface INavigation {
    id: string | number;
    text: string;
    path: string;
    icon: JSX.Element;
    permission: IPermission
}

export interface ITransportRequest {
    id?: string | number;
    user?: IUser
    requestDate?: string | null;
    requestTime?: string | null;
    timeRequired: string;
    dateRequired: string;
    destination: string;
    reason: string;
    duration: string;
    priority: string;
    status?: string | null;
    notes: string;
    signature?: string | null
}

export interface ITransportRequestTableData {
    name: string;
    requestDate?: string | null;
    requestTime?: string | null;
    timeRequired: string;
    dateRequired: string;
    destination: string;
    reason: string;
    duration: string;
    priority: string;
    status?: string | null;
    notes: string;
    signature?: string | null
}


export interface ITransportRequestForm {
    formState: FormState<ITransportRequest> & {
        errors: {
            requestDate?: FieldError;
            requestTime?: FieldError;
            timeRequired?: FieldError;
            dateRequired?: FieldError;
            destination?: FieldError;
            reason?: FieldError;
            duration?: FieldError;
            priority?: FieldError;
            status?: FieldError;
            notes?: FieldError;
            signature?: FieldError
        };
    };
    control: Control<ITransportRequest>;
    register: UseFormRegister<ITransportRequest>;
    buttonText: string;
    sendingRequest: boolean;
}
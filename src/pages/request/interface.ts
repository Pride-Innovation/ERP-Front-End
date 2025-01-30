import {
    Control,
    FieldError,
    FormState,
    UseFormRegister
} from "react-hook-form";
import { IUser } from "../users/interface";
import { IPermission } from "../settings/interface";
import { Dispatch, SetStateAction } from "react";

export interface IAssetParticulars {
    name: string;
    serialNumber: string;
    engravedNumber: string;
}

export interface IRequest {
    id?: string | number;
    user?: IUser
    reason: string;
    purpose?: string;
    quantity: number;
    status?: string | null;
    desc: string;
    date: string;
    requester?: IUser
}

export interface IRequestTableData {
    department?: string;
    name: string;
    reason: string;
    quantity: number;
    status?: string | null;
    desc: string;
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
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    buttonText: string;
    request: IRequest | ITransportRequest
}

export interface IRequestDetails {
    open: boolean;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    handleClose: () => void;
    data: IRequest | ITransportRequest
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
    requestDate?: string | null;
    requesterID?: number | null,
    timeVehicleIsRequired: string;
    dateVehicleIsRequired: string;
    destination: string;
    purpose: string;
    duration: string;
    priority: string;
    timeOfSubmissionOfRequest?: string | null;
    desc?: string | null;
    signature?: any | null,
    status?: string | null;
    position?: string | null;
    fromPosition?: string | null
    Narration?: string | null,
    requester?: IUser,
    approvedAt?: string | null,
    approvedBy?: string | number
}

export interface ITransportRequestTableData {
    name: string;
    requestDate?: string | null;
    requesterID?: number | null,
    timeVehicleIsRequired: string;
    dateVehicleIsRequired: string;
    destination: string;
    purpose: string;
    duration: string;
    priority: string;
    timeOfSubmissionOfRequest: string
    desc?: string | null;
    signature?: any | null,
    status?: string | null;
    position?: string | null;
    fromPosition?: string | null
    Narration?: string | null,
    requester?: IUser
}


export interface ITransportRequestForm {
    formState: FormState<ITransportRequest> & {
        errors: {
            timeVehicleIsRequired?: FieldError;
            dateVehicleIsRequired?: FieldError;
            destination?: FieldError;
            purpose?: FieldError;
            duration?: FieldError;
            priority?: FieldError;
            timeOfSubmissionOfRequest?: FieldError;
            desc?: FieldError;
            status?: FieldError;
            position?: FieldError;
            fromPosition?: FieldError
            Narration?: FieldError;
        };
    };
    control: Control<ITransportRequest>;
    register: UseFormRegister<ITransportRequest>;
    buttonText: string;
    sendingRequest: boolean;
}
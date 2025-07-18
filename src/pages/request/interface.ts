/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Control,
    FieldError,
    FormState,
    UseFormRegister
} from "react-hook-form";
import { IUser } from "../users/interface";
import { IPermission } from "../settings/interface";
import { Dispatch, SetStateAction } from "react";
import { IStatus } from "../settings/statuses/interface";
import { IAxiosResponse, IFetchDataRequest } from "../../core/apis/interface";
import { ICommodity } from "../settings/commodity/interface";

export interface IAssetParticulars {
    name: string;
    serialNumber: string;
    engravedNumber: string;
}

export interface IRequestReport {
    id?: number | string;
    request: IRequest;
    approver: IUser;
    status: IStatus;
    comment: string;
    createDate: string;
    lastModified: string;
    createdBy: IUser;
    lastModifiedBy: IUser;
    message?: string;
}

export interface IRequest {
    id?: string | number,
    name: string,
    priority: string,
    description?: string | null,
    signaturePath?: any | null,
    status?: IStatus | null
    timeOfSubmissionOfRequest?: string | null,
    createDate?: string | null,
    lastModified?: string | null,
    createdBy?: IUser | null,
    lastModifiedBy?: IUser | null,
    requester?: IUser | null
    requestReports?: Array<IRequestReport>,
    currentApprover?: IUser | null,
    commodities?: Array<{
        commodity: ICommodity,
        quantity: number
    }> | null,
    emailMessage?: string | null
}

export interface IRequestTableData {
    name: string;
    requestDate?: string | null;
    priority: string;
    status?: string | null;
    requester?: string;
    currentApprover?: string;
    requestedFrom?: string;
    requesterID?: number | null;
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
    setImage: Dispatch<SetStateAction<string>>
    image: string;
    setFile?: Dispatch<SetStateAction<File | null>>
    file?: File | null;
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

export interface IRequestResponse extends IFetchDataRequest {
    content: Array<IRequest>
}

export interface IRequestsAxiosResponse extends IAxiosResponse {
    data: IRequestResponse
}

export interface IRequestAxiosResponse extends IAxiosResponse {
    data: IRequest
}


export interface IRejectRequest {
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string;
    request: IRequest;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
}


export interface IApproveRequest {
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string;
    request: IRequest;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
}

export interface IAcknowledegeRequest {
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string;
    request: IRequest;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
}

export interface IAcknowledegeReceipt {
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string;
    request: IRequest;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
}

export interface IIssueRequest {
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string;
    request: IRequest;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
}


export interface ICommodityTableData {
    id: number,
    name: string;
    unitOfMeasure: string;
    assetType: string;
    quantity: number;
}


export interface IRequestReportTableData {
    id: number;
    approver: string;
    status: string;
    comment: string;
    createDate: string;
}

export interface IAcknowledgeRequestResponse {
    id: number | string;
    request: IRequest;
    comment: string;
    createDate: string;
    lastModified: string;
    createdBy: IUser | null;
    lastModifiedBy: IUser | null;
}


export interface IAcknowledgeRequesttAxiosResponse extends IAxiosResponse {
    data: IAcknowledgeRequestResponse
}

export interface IApproveIssuance {
    handleClose: () => void;
    sendingRequest: boolean;
    buttonText: string;
    request: IRequest;
    setSendingRequest: Dispatch<SetStateAction<boolean>>
}
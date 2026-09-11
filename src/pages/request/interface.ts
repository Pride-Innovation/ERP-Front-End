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
    UseFormRegister,
    UseFormSetValue
} from "react-hook-form";
import { IUser } from "../users/interface";
import { IPermission } from "../settings/interface";
import { Dispatch, SetStateAction } from "react";
import { IStatus } from "../settings/statuses/interface";
import { IAxiosResponse, IFetchDataRequest } from "../../core/apis/interface";
import { ICommodity } from "../settings/commodity/interface";
import { IAssetType } from "../settings/assetTypes/interface";

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
    /**
     * The unit a group step is routed to, when it is routed to a unit rather than a person.
     *
     * <p>The engine admits a member of this unit as a valid actor, and the inbox listing already
     * matches on it — so without it the page shows such a request as awaiting the viewer and then
     * offers no button.
     */
    currentUnit?: { id?: string | number | null; name?: string } | null,
    /**
     * What the workflow is waiting for: REQUEST_APPROVAL, ACKNOWLEDGE_REQUEST, ISSUANCE,
     * ACKNOWLEDGE_RECEIPT — or null for a finished, rejected or pre-engine request.
     *
     * <p>This is what decides which action to offer. Status cannot: `unitAcknowledged` sits among the
     * approval codes while the workflow has already moved to issuance, so a menu built from status
     * offers Approve on a request nobody can approve.
     */
    currentStepType?: string | null,
    commodities?: Array<{
        commodity: ICommodity,
        quantity: number
    }> | null,
    emailMessage?: string | null,
    /** Primary asset category for the request — drives custom attributes and workflow selection. */
    assetTypeId?: string | number | null,
    assetType?: IAssetType | null,
    /** Values for the category's custom attributes, keyed by attribute key (e.g. { warranty_months: 24 }). */
    attributes?: Record<string, any> | null,
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
    /*
     * Carried for the row menu, never displayed.
     *
     * The menu decides what to offer from the same rules the detail page uses, and those ask who
     * the step is routed to and what kind of step it is. Ids and the step type rather than the
     * objects, so nothing here can be mistaken for something to render.
     */
    currentApproverId?: number | string | null;
    currentUnitId?: number | string | null;
    currentStepType?: string | null;
    /** Marks the row as an asset request, which is what selects its menu rules. */
    rowKind?: string;
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
    setValue: UseFormSetValue<IRequest>;
    buttonText: string;
    sendingRequest: boolean;
    setImage: Dispatch<SetStateAction<string>>
    image: string;
    setFile?: Dispatch<SetStateAction<File | null>>
    file?: File | null;
    initialFile?: {
        fileName: string | null;
        fileType: 'pdf' | 'word' | 'excel' | 'image' | 'other';
        filePath: string | null;
    };
    onRemoveFile?: () => void;
    hideFileUpload?: boolean;
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
    permission?: IPermission | string
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

export interface IRequestReportAxiosResponse extends IAxiosResponse {
    data: IRequestReport
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

export interface IBranchAssetStatics {
    assigned: number;
    unassigned: number;
    inMaintenance: number;
    total: number;
    assetType: string;
}

export interface IBranchAssetStaticsAxiosResponse extends IAxiosResponse {
    data: Array<IBranchAssetStatics>
}

export interface AssetStats {
    total: number;
    assigned: number;
    inMaintenance: number;
    unassigned: number;
    /** Original display name from the API (e.g. "IT Equipment") */
    label?: string;
}

/** Keyed by normalised type name (spaces stripped, lower-cased). Dynamic — supports any asset type. */
export type BranchAssetStats = Record<string, AssetStats>;

export interface SubDomain {
    id: number;
    name: string;
    type: string;
    serial: string;
    engravingNumber: string;
    status: 'Active' | string;
}

export interface AssetDomain {
    id: number;
    domain: string;
    plan: string;
    totalItems: number;
    available: number;
    domains: number;
    status: 'Active' | string;
    subDomains: SubDomain[];
}

export interface ChipColorConfig {
    bg: string;
    color: string;
}

export interface StatusColorConfig extends ChipColorConfig {
    icon?: React.ReactNode;
}

export interface IPersonalAssetReport {
    type: string;
    /**
     * The category's id.
     *
     * Needed because the asset detail route is per-category — `/assets/general/{typeId}/view/{id}`
     * — so a payload carrying only the category name cannot produce a working link.
     */
    typeId: number | null;
    totalItems: number;
    assets: {
        id: number;
        name: string;
        engravingNumber: string;
        status: string;
        serialNumber: string;
        /** The branch holding it, for a person whose items span more than one. */
        location?: string | null;
    }[];
}

export interface IPersonalAssetReportAxiosResponse extends IAxiosResponse {
    data: Array<IPersonalAssetReport>
}
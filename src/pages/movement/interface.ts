/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Dispatch, SetStateAction } from 'react';
import { Control, FormState, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { IAxiosResponse, IFetchDataRequest } from '../../core/apis/interface';
import { IAsset } from '../assets/interface';
import { IUser } from '../users/interface';
import { IPermission } from '../settings/interface';

export interface IMovementReport {
    id?: string | number;
    action: string;
    comment?: string | null;
    actor?: IUser | null;
    createDate?: string | null;
}

export interface IMovementAsset {
    id?: string | number;
    asset: IAsset;
}

export interface IMovement {
    id?: string | number;
    referenceNo?: string;
    requestingOfficer?: IUser | null;
    destination?: string;
    destinationId?: string | number | null;
    destinationType?: 'Branch' | 'Department' | 'External';
    reason?: string;
    expectedReturnDate?: string | null;
    status?: { id?: number; name: string } | null;
    assetsCount?: number;
    rejectionComment?: string | null;
    approvedBy?: IUser | null;
    approvedDate?: string | null;
    securityPassAvailable?: boolean;
    releasedBy?: IUser | null;
    releasedDate?: string | null;
    receivedBy?: IUser | null;
    receivedDate?: string | null;
    createDate?: string | null;
    lastModified?: string | null;
    createdBy?: IUser | null;
    lastModifiedBy?: IUser | null;
    movementReports?: IMovementReport[];
    movementAssets?: IMovementAsset[];
}

/** Form data submitted through react-hook-form */
export interface IMovementFormData {
    officerId: string | number;
    approverId?: string | number | null;
    destination: string;
    destinationId?: string | number | null;
    destinationType: string;
    assetIds?: (string | number)[];
    reason: string;
    expectedReturnDate: string;
}

/** Paginated API response shape */
export interface IMovementFetchResponse extends IFetchDataRequest {
    content: Array<IMovement>;
}

export interface IMovementsAxiosResponse extends IAxiosResponse {
    data: IMovementFetchResponse;
}

export interface IMovementAxiosResponse extends IAxiosResponse {
    data: IMovement;
}

export interface INavigation {
    id: number;
    text: string;
    path: string;
    icon: JSX.Element;
    permission?: IPermission;
}

/** Action modal prop interfaces */
export interface IMovementAction {
    movement: IMovement;
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    buttonText?: string;
}

export interface IMovementForm {
    register: UseFormRegister<any>;
    control: Control<any>;
    formState: FormState<IMovementFormData> & { errors: any };
    setValue: UseFormSetValue<any>;
    sendingRequest: boolean;
    buttonText: string;
    onFilesChange?: (files: File[]) => void;
    initialAssets?: IAsset[];
}

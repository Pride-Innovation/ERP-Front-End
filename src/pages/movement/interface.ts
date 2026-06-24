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
import { ICommodity } from '../settings/commodity/interface';
import { IUser } from '../users/interface';
import { IPermission } from '../settings/interface';
import { MovementCategory, MovementStatus, MovementType, ReceiptStatus, StoreType } from './constants';

/** A store container (location + type + optional department) — `/inventory/stores` (StoreView). */
export interface IStoreView {
    id: number;
    name: string;
    storeType: StoreType;
    locationId: number;
    locationName: string;
    departmentId?: number | null;
    departmentName?: string | null;
    active: boolean;
}

/** Full store container as embedded in a Movement (source/dest). */
export interface IStore {
    id: number | string;
    name?: string;
    storeType?: StoreType;
    location?: { id: number | string; name: string };
    department?: { id: number | string; name: string } | null;
}

/** A line on a movement — exactly one of asset / commodity. */
export interface IMovementItem {
    id?: number | string;
    asset?: IAsset | null;
    commodity?: ICommodity | null;
    quantity: number;
    serialNumber?: string | null;
    assetTag?: string | null;
}

/** A movement as returned by the backend. */
export interface IMovement {
    id?: number | string;
    movementType?: MovementType;
    movementCategory?: MovementCategory;
    status?: MovementStatus;

    sourceStore?: IStore | null;
    destStore?: IStore | null;
    recipientUser?: IUser | null;

    courierService?: string | null;
    trackingNumber?: string | null;
    dispatchDate?: string | null;
    expectedDeliveryDate?: string | null;
    deliveryDocuments?: string[];

    receivingOfficer?: IUser | null;
    receiptDate?: string | null;
    receiptStatus?: ReceiptStatus | null;
    remarks?: string | null;

    initiator?: IUser | null;
    completionDate?: string | null;
    inventorySettled?: boolean;

    request?: { id: number | string } | null;
    repair?: { id: number | string } | null;

    items?: IMovementItem[];

    createDate?: string | null;
    lastModified?: string | null;
    createdBy?: number | string | null;
    lastModifiedBy?: number | string | null;
}

/** Item line collected in the create form before submission. */
export interface IMovementItemDraft {
    assetId?: number | string | null;
    commodityId?: number | string | null;
    quantity: number;
    /** UI-only label for display in the queue. */
    label?: string;
    subLabel?: string;
}

/** Request body for POST /movements (mirrors MovementDTO). */
export interface IMovementCreatePayload {
    movementType: MovementType;
    sourceStoreId: number | string;
    destStoreId?: number | string | null;
    recipientUserId?: number | string | null;
    courierService?: string | null;
    trackingNumber?: string | null;
    dispatchDate?: string | null;
    expectedDeliveryDate?: string | null;
    deliveryDocuments?: string[];
    requestId?: number | string | null;
    repairId?: number | string | null;
    remarks?: string | null;
    items: { assetId?: number | string | null; commodityId?: number | string | null; quantity?: number }[];
}

/** react-hook-form shape for the create form. */
export interface IMovementFormData {
    movementType: MovementType | '';
    sourceStoreId: number | string;
    destinationKind: 'STORE' | 'USER';
    destStoreId?: number | string | null;
    recipientUserId?: number | string | null;
    courierService?: string | null;
    trackingNumber?: string | null;
    dispatchDate?: string | null;
    expectedDeliveryDate?: string | null;
    remarks?: string | null;
}

/** Paginated list response. */
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

/** Props for the lifecycle action modals. */
export interface IMovementAction {
    movement: IMovement;
    handleClose: () => void;
    sendingRequest: boolean;
    setSendingRequest: Dispatch<SetStateAction<boolean>>;
    onDone?: (updated?: IMovement) => void;
    buttonText?: string;
}

export interface IMovementForm {
    register: UseFormRegister<any>;
    control: Control<any>;
    formState: FormState<IMovementFormData> & { errors: any };
    setValue: UseFormSetValue<any>;
    watch: (name?: string) => any;
    items: IMovementItemDraft[];
    setItems: Dispatch<SetStateAction<IMovementItemDraft[]>>;
    sendingRequest: boolean;
    buttonText: string;
    onFilesChange?: (files: File[]) => void;
}

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
    /**
     * The person handing items back, on a RETURN_TO_STORE. Exactly one of this and `sourceStore` is
     * set — a return leaves from someone's desk, not a shelf — so a view that reads only
     * `sourceStore` shows no origin at all for those.
     */
    sourceUser?: IUser | null;
    destStore?: IStore | null;
    recipientUser?: IUser | null;

    courierService?: string | null;
    trackingNumber?: string | null;
    dispatchDate?: string | null;
    expectedDeliveryDate?: string | null;
    deliveryDocuments?: string[];
    /** The courier currently (or last) holding custody — set at dispatch. */
    courier?: { id: number | string; name: string; vetted?: boolean } | null;
    plateNumber?: string | null;
    /** True once the source → courier custody-store ledger hop has been applied. */
    custodyTransferSettled?: boolean;

    /**
     * The journey this movement rides on, if any. Set means dispatch and transit belong to the
     * consignment — a movement travelling with others is never driven on its own.
     */
    consignment?: { id: number; reference?: string | null; status?: string | null } | null;

    receivingOfficer?: IUser | null;
    receiptDate?: string | null;
    receiptStatus?: ReceiptStatus | null;
    remarks?: string | null;

    initiator?: IUser | null;
    /** While DRAFT (awaiting approval): the ladder tier that must approve now. */
    currentApprover?: IUser | null;
    approvalTierIndex?: number;
    completionDate?: string | null;
    inventorySettled?: boolean;

    /**
     * The request this movement fulfils, if any.
     *
     * <p>`requesterId` is carried because being the requester is one of the ways a person is party to
     * a movement, and so one of the ways it is theirs at SELF scope.
     */
    request?: { id: number | string; requesterId?: number | string | null } | null;
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

/**
 * Request body for POST /movements (a subset of MovementDTO).
 *
 * <p>Carries no courier, tracking number or delivery dates. `MovementDTO` still accepts them —
 * the repair flows post their own bodies to their own endpoints — but a movement written from the
 * create form has no carrier yet, and both dispatch paths overwrite those fields anyway.
 */
export interface IMovementCreatePayload {
    movementType: MovementType;
    sourceStoreId: number | string;
    destStoreId?: number | string | null;
    recipientUserId?: number | string | null;
    deliveryDocuments?: string[];
    requestId?: number | string | null;
    repairId?: number | string | null;
    remarks?: string | null;
    /**
     * Opt a movement into the initiator's approval ladder. The manual create form no longer sends
     * this — the server derives it from the movement category — but the repair and return flows do,
     * since those need approval even when they stay within one location.
     */
    requiresApproval?: boolean | null;

    /**
     * Sent only on a retry, once the server has reported that no approver could be resolved and the
     * user has confirmed they want to continue. Recorded against the movement and its approval trail
     * — the exception is documented, not waived.
     */
    proceedWithoutApproval?: boolean;
    bypassReason?: string;
    items: { assetId?: number | string | null; commodityId?: number | string | null; quantity?: number }[];
}

/** react-hook-form shape for the create form. */
export interface IMovementFormData {
    movementType: MovementType | '';
    sourceStoreId: number | string;
    destinationKind: 'STORE' | 'USER';
    destStoreId?: number | string | null;
    recipientUserId?: number | string | null;
    remarks?: string | null;
}

/**
 * What a repair-flow form can state before anything is submitted. Every field is display-only —
 * none of it is sent back, because the server re-derives it on write from the same code path.
 */
export interface IMovementFlowPreview {
    sourceStoreName?: string | null;
    sourceLocationName?: string | null;
    destinationStoreName?: string | null;
    destinationLocationName?: string | null;
    /** Drives whether the form asks for courier, tracking, dispatch and expected-delivery at all. */
    interLocation: boolean;
    recipientUserId?: number | null;
    recipientUserName?: string | null;
    /** The recorded holder has left, so the asset returns to its branch unassigned as pool stock. */
    returningToBranchUnassigned: boolean;
    loanerAssetId?: number | null;
    loanerAssetLabel?: string | null;
    /** Set when the flow cannot proceed — shown beside the field rather than thrown at submit. */
    blockedReason?: string | null;
}

/**
 * An asset offered by the disposal picker. The age judgement is made server-side so the same rule
 * governs what the picker shows and what the write endpoint accepts.
 */
export interface IDisposalCandidate {
    id: number;
    name?: string | null;
    engravedNumber?: string | null;
    serialNumber?: string | null;
    assetTypeName?: string | null;
    storeName?: string | null;
    locationName?: string | null;
    monthsInService: number;
    usefulLifeMonths?: number | null;
    /** When false, disposing this asset requires a written reason. */
    pastUsefulLife: boolean;
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

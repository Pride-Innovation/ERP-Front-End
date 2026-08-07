/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * A consignment is one physical journey carrying any number of movements to the same destination.
 *
 * <p>It exists because a movement is an obligation — these items, owed to this person, under this
 * approval — while a journey is a courier, a tracking number and a dispatch. One van can carry stock
 * for several requests to the same branch, which a single movement could never express.
 */

export type ConsignmentStatus = 'DRAFT' | 'DISPATCHED' | 'IN_TRANSIT' | 'ARRIVED' | 'CANCELLED';

export interface IRefSummary {
    id?: number | null;
    name?: string | null;
}

/** One thing being carried, flattened for printing on the dispatch note. */
export interface IConsignmentItemLine {
    name?: string | null;
    /** Engraved number or serial for an asset; blank for a consumable. */
    reference?: string | null;
    /** `Asset` or `Consumable` — what the storekeeper is counting. */
    kind?: string | null;
    quantity: number;
}

/** Just enough of a movement to list it inside its journey and link through to it. */
export interface IConsignmentMovement {
    id: number;
    movementType?: string | null;
    status?: string | null;
    requestId?: number | null;
    sourceStoreName?: string | null;
    destinationName?: string | null;
    recipientName?: string | null;
    itemCount: number;
    /** Present on the detail read, so the note can list everything on the van before dispatch. */
    items?: IConsignmentItemLine[];
}

export interface IConsignment {
    id: number;
    reference?: string | null;
    status: ConsignmentStatus;

    sourceLocation?: IRefSummary | null;
    destLocation?: IRefSummary | null;
    /** The store the goods landed in — set at arrival, and what each movement then draws from. */
    landingStore?: IRefSummary | null;

    courier?: IRefSummary | null;
    courierService?: string | null;
    trackingNumber?: string | null;
    plateNumber?: string | null;
    dispatchDate?: string | null;
    expectedDeliveryDate?: string | null;
    arrivalDate?: string | null;
    deliveryDocuments?: string[] | null;

    remarks?: string | null;
    initiator?: { id?: number | null; name?: string | null } | null;
    receivingOfficer?: { id?: number | null; name?: string | null } | null;

    movementCount: number;
    /** Populated on the detail read only; a list response leaves this undefined. */
    movements?: IConsignmentMovement[];

    createDate?: string | null;
}

export interface IConsignmentCreatePayload {
    sourceLocationId: number | string;
    destLocationId: number | string;
    remarks?: string | null;
    movementIds?: number[];
}

export interface IConsignmentDispatchPayload {
    courierId?: number | null;
    courierName?: string | null;
    plateNumber?: string | null;
    trackingNumber?: string | null;
    dispatchDate?: string | null;
    expectedDeliveryDate?: string | null;
    deliveryDocuments: string[];
}

export const consignmentStatusLabels: Record<ConsignmentStatus, string> = {
    DRAFT: 'Being loaded',
    DISPATCHED: 'Dispatched',
    IN_TRANSIT: 'In transit',
    ARRIVED: 'Arrived',
    CANCELLED: 'Cancelled',
};

/** What each state means for the goods, so the UI can explain rather than just label. */
export const consignmentStatusHelp: Record<ConsignmentStatus, string> = {
    DRAFT: 'Movements can still be added and removed. Nothing has left the store.',
    DISPATCHED: 'Handed to the courier with a signed note. Contents are frozen.',
    IN_TRANSIT: 'Stock has left the source stores and sits against the courier.',
    ARRIVED: 'Stock is in the destination store. Each movement is handed over separately.',
    CANCELLED: 'Abandoned before dispatch. Its movements were released.',
};

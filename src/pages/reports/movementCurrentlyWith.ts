/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * "Currently With" for one movement - who or what has the items now, read from the stage it is at.
 *
 * <p>The column used to show `currentApprover` alone, which is set only while a movement waits for
 * approval and is cleared as it is approved. Measured when replaced: empty on all 110 movements, so
 * the column read "—" on every row. Each stage has its own answer, and the movement already carries
 * every one of them:
 *
 * | Status | With |
 * |---|---|
 * | DRAFT | the approver it is waiting on |
 * | INITIATED | the source - approved, not yet dispatched |
 * | DISPATCHED / IN_TRANSIT | the courier |
 * | RECEIVED | the officer who signed for it |
 * | COMPLETED | the person it was delivered to, else the destination store |
 *
 * <p>For a completed movement this is where *this* movement left the items, not where an asset is
 * today if it has moved again since.
 */

interface Party { firstName?: string | null; lastName?: string | null }
interface Named { name?: string | null }

export interface IMovementParties {
    status?: string | null;
    currentApprover?: Party | null;
    sourceStore?: Named | null;
    sourceUser?: Party | null;
    destStore?: Named | null;
    recipientUser?: Party | null;
    receivingOfficer?: Party | null;
    courier?: Named | null;
    courierService?: string | null;
    plateNumber?: string | null;
    trackingNumber?: string | null;
    /** The courier's own reference, from their system - optional, and printed only when present. */
    courierReference?: string | null;
}

const personName = (p?: Party | null): string | null => {
    const name = `${p?.firstName ?? ''} ${p?.lastName ?? ''}`.trim();
    return name || null;
};

const labelled = (stage: string, who: string | null | undefined): string => (who ? `${stage} · ${who}` : stage);

/**
 * What identifies a movement on the road: the vehicle, our tracking number, and the courier's own
 * reference when one was given. On a consignment the journey's plate and number are copied onto each
 * movement, so every row carries them. Missing parts are left out rather than shown blank.
 */
export const movementTransitDetail = (m: IMovementParties): string | null => {
    if (m.status !== 'DISPATCHED' && m.status !== 'IN_TRANSIT') return null;
    const parts = [
        m.plateNumber?.trim() ? `Plate ${m.plateNumber.trim()}` : null,
        m.trackingNumber?.trim() || null,
        m.courierReference?.trim() ? `Ref ${m.courierReference.trim()}` : null,
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : null;
};

/** The one-line form - what an export prints. The table shows the detail on a line of its own. */
export const movementCurrentlyWith = (m: IMovementParties): string => {
    const headline = movementCurrentlyWithHeadline(m);
    const detail = movementTransitDetail(m);
    return detail ? `${headline} · ${detail}` : headline;
};

export const movementCurrentlyWithHeadline = (m: IMovementParties): string => {
    switch (m.status) {
        case 'DRAFT':
            return labelled('Awaiting approval', personName(m.currentApprover));
        case 'INITIATED':
            return labelled('Awaiting dispatch', m.sourceStore?.name || personName(m.sourceUser));
        case 'DISPATCHED':
        case 'IN_TRANSIT':
            return labelled('In transit', m.courier?.name || m.courierService);
        case 'RECEIVED':
            return labelled('Received',
                personName(m.receivingOfficer) || personName(m.recipientUser) || m.destStore?.name);
        case 'COMPLETED':
            return labelled('Delivered', personName(m.recipientUser) || m.destStore?.name);
        case 'CANCELLED':
            return 'Cancelled';
        default:
            return '—';
    }
};

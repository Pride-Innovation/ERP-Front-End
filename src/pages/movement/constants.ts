/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * Movement domain constants mirroring the backend `pride.bank.erp.movement` enums.
 * Replaces the legacy gate-pass mock module.
 */

export type MovementStatus =
    | 'DRAFT'
    | 'INITIATED'
    | 'DISPATCHED'
    | 'IN_TRANSIT'
    | 'RECEIVED'
    | 'COMPLETED'
    | 'CANCELLED';

export type MovementType =
    | 'REPLENISHMENT'
    | 'ISSUANCE_FULFILLMENT'
    | 'DEPARTMENT_TRANSFER'
    | 'REPAIR_TRANSFER'
    | 'TEMP_REPLACEMENT'
    | 'RETURN_AFTER_REPAIR'
    | 'DISPOSAL_TRANSFER'
    | 'RETURN_TO_STORE';

export type MovementCategory = 'INTER_LOCATION' | 'INTRA_LOCATION';

export type ReceiptStatus = 'PENDING' | 'RECEIVED_OK' | 'RECEIVED_WITH_DISCREPANCY';

export type StoreType = 'ADMIN' | 'IT' | 'DISPOSAL';

interface IStatusCfg {
    label: string;
    bg: string;
    color: string;
    border: string;
}

/** Visual config per movement status. */
export const statusConfig: Record<MovementStatus, IStatusCfg> = {
    DRAFT: { label: 'Draft', bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' },
    INITIATED: { label: 'Initiated', bg: '#FEF9C3', color: '#A16207', border: '#FDE68A' },
    DISPATCHED: { label: 'Dispatched', bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE' },
    IN_TRANSIT: { label: 'In Transit', bg: '#E0E7FF', color: '#4338CA', border: '#C7D2FE' },
    RECEIVED: { label: 'Received', bg: '#D1FAE5', color: '#047857', border: '#A7F3D0' },
    COMPLETED: { label: 'Completed', bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0' },
    CANCELLED: { label: 'Cancelled', bg: '#FEE2E2', color: '#B91C1C', border: '#FECACA' },
};

export const getStatusConfig = (status?: string): IStatusCfg =>
    (status && statusConfig[status as MovementStatus]) || {
        label: status ?? '—',
        bg: '#F1F5F9',
        color: '#475569',
        border: '#E2E8F0',
    };

/**
 * Semantic tone per status for the shared `<StatusChip>` layout component —
 * use this instead of hand-rolled colour pairs so movement pages match the app.
 */
export const statusTone = (
    status?: string,
): 'success' | 'pending' | 'danger' | 'info' | 'brand' | 'gold' | 'neutral' => {
    switch (status) {
        case 'DRAFT': return 'pending';
        case 'INITIATED': return 'gold';
        case 'DISPATCHED':
        case 'IN_TRANSIT': return 'info';
        case 'RECEIVED': return 'brand';
        case 'COMPLETED': return 'success';
        case 'CANCELLED': return 'danger';
        default: return 'neutral';
    }
};

export const statusLabel = (status?: string): string => getStatusConfig(status).label;

/** Human labels for each movement type. */
export const movementTypeLabels: Record<MovementType, string> = {
    REPLENISHMENT: 'Replenishment',
    ISSUANCE_FULFILLMENT: 'Issuance Fulfillment',
    DEPARTMENT_TRANSFER: 'Department Transfer',
    REPAIR_TRANSFER: 'Repair Transfer',
    TEMP_REPLACEMENT: 'Temporary Replacement',
    RETURN_AFTER_REPAIR: 'Return After Repair',
    DISPOSAL_TRANSFER: 'Disposal Transfer',
    // Raised by "Receive into Store" — the source is a person, not a store, so it is not one of
    // the types offered on the create form.
    RETURN_TO_STORE: 'Return to Store',
};

export const movementTypeLabel = (type?: string): string =>
    (type && movementTypeLabels[type as MovementType]) || type || '—';

/**
 * Movement types a user can initiate directly from the create form (store-to-store / to-user).
 *
 * ISSUANCE_FULFILLMENT is deliberately absent. It exists to satisfy a request and is created
 * automatically at issuance approval, carrying that request's id; one made by hand has no request
 * attached, so the by-request views and the fulfilment logic cannot resolve it. Restocking a branch
 * or a department with no request behind it is REPLENISHMENT or DEPARTMENT_TRANSFER — both here.
 */
export const creatableMovementTypes: { value: MovementType; label: string; description: string }[] = [
    { value: 'REPLENISHMENT', label: 'Replenishment', description: 'Stock a branch from Head Office' },
    { value: 'DEPARTMENT_TRANSFER', label: 'Department Transfer', description: 'Reallocate between departments / users' },
];

export const categoryLabels: Record<MovementCategory, string> = {
    INTER_LOCATION: 'Inter-Location',
    INTRA_LOCATION: 'Intra-Location',
};

export const receiptStatusLabels: Record<ReceiptStatus, string> = {
    PENDING: 'Pending',
    RECEIVED_OK: 'Received OK',
    RECEIVED_WITH_DISCREPANCY: 'Received with Discrepancy',
};

export const storeTypeLabels: Record<StoreType, string> = {
    ADMIN: 'Admin Store',
    IT: 'IT Store',
    DISPOSAL: 'Disposal Store',
};

/**
 * A movement travelling with others is dispatched, tracked and landed as part of its consignment,
 * never on its own — the load moves together and its ledger hops apply to everything on board at
 * once. These helpers therefore hide the per-movement actions the server would refuse anyway.
 */
const onLiveConsignment = (m: { consignment?: { status?: string | null } | null }) =>
    !!m.consignment && m.consignment.status !== 'CANCELLED';

/** Whether the movement is awaiting dispatch (inter-location, approved and not yet shipped). */
export const canDispatch = (m: {
    movementCategory?: string; status?: string; consignment?: { status?: string | null } | null;
}) => m.movementCategory === 'INTER_LOCATION' && m.status === 'INITIATED' && !onLiveConsignment(m);

/**
 * A movement can join a van under exactly the conditions that let it be driven on its own: approved,
 * inter-location, and not already riding on something. The two are alternatives offered at the same
 * moment — consolidate it with the rest of the load, or dispatch it alone — so they share a rule
 * rather than restating one that could drift from the other.
 */
export const canLoadOntoConsignment = canDispatch;

/**
 * Where a movement starts and ends, as location ids.
 *
 * <p>Either end can be a store or a person — a return leaves someone's desk, a transfer to a user
 * ends at their branch — so reading only the store side silently loses half the cases. These mirror
 * {@code ConsignmentService.sourceLocationId} / {@code destinationLocationId}, which is what
 * actually accepts or refuses a movement when it is loaded onto a consignment.
 */
type MovementEnds = {
    sourceStore?: { location?: { id?: number | string | null } | null } | null;
    sourceUser?: { branch?: { id?: number | string | null } | null } | null;
    destStore?: { location?: { id?: number | string | null } | null } | null;
    recipientUser?: { branch?: { id?: number | string | null } | null } | null;
};

export const movementSourceLocationId = (m: MovementEnds): number | string | null =>
    m.sourceStore?.location?.id ?? m.sourceUser?.branch?.id ?? null;

export const movementDestinationLocationId = (m: MovementEnds): number | string | null =>
    m.destStore?.location?.id ?? m.recipientUser?.branch?.id ?? null;

/** Location ids arrive as numbers or strings depending on the endpoint, so compare them loosely. */
export const sameLocation = (a?: number | string | null, b?: number | string | null) =>
    a != null && b != null && String(a) === String(b);

/** Marking in-transit is compulsory, not optional — it's the only way out of DISPATCHED. */
export const canMarkInTransit = (m: { status?: string; consignment?: { status?: string | null } | null }) =>
    m.status === 'DISPATCHED' && !onLiveConsignment(m);

/**
 * Inter-location movements can only be received once actually marked in-transit — the backend
 * rejects receiving straight from DISPATCHED, since custody must hand off to the courier first.
 *
 * <p>On a consignment the goods also have to have landed: receiving earlier would draw stock out of
 * a store they have not reached.
 */
export const canReceive = (m: {
    movementCategory?: string; status?: string; consignment?: { status?: string | null } | null;
}) => m.movementCategory === 'INTER_LOCATION' && m.status === 'IN_TRANSIT'
    && (!onLiveConsignment(m) || m.consignment?.status === 'ARRIVED');

/** Intra-location movements complete in one step (once approved / initiated). */
export const canComplete = (m: { movementCategory?: string; status?: string }) =>
    m.movementCategory === 'INTRA_LOCATION' && (m.status === 'INITIATED' || m.status === 'RECEIVED');

/**
 * The server's "no approver could be resolved" refusal, if that is what this response is.
 *
 * <p>Keys off `errorCode` rather than the message text, so re-wording the explanation cannot quietly
 * break the client's ability to offer the override. Reads both shapes because the movement services
 * `catch (error) { return error }` — a 4xx arrives as an AxiosError, with the body one level deeper.
 *
 * @returns the server's explanation to show the user, or null when this is some other outcome
 */
export const noApproverError = (res: any): string | null => {
    const data = res?.response?.data ?? res?.data;
    if (data?.errorCode !== 'NO_APPROVER') return null;
    return data.detail ?? data.message ?? 'No approver could be resolved on your reporting line.';
};

export const canCancel = (m: { status?: string }) =>
    m.status !== 'COMPLETED' && m.status !== 'CANCELLED';

/**
 * A DRAFT movement is awaiting approval. The current user can act on it only when they are the
 * tier currently assigned (`currentApprover`).
 */
export const isPendingApproval = (m: { status?: string }) => m.status === 'DRAFT';

export const canApproveMovement = (
    m: { status?: string; currentApprover?: { id?: number | string } | null },
    currentUserId?: number | string,
) =>
    m.status === 'DRAFT'
    && m.currentApprover?.id != null
    && String(m.currentApprover.id) === String(currentUserId ?? '');

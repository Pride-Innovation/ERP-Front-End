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
    | 'DISPOSAL_TRANSFER';

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

/** Human labels for each movement type. */
export const movementTypeLabels: Record<MovementType, string> = {
    REPLENISHMENT: 'Replenishment',
    ISSUANCE_FULFILLMENT: 'Issuance Fulfillment',
    DEPARTMENT_TRANSFER: 'Department Transfer',
    REPAIR_TRANSFER: 'Repair Transfer',
    TEMP_REPLACEMENT: 'Temporary Replacement',
    RETURN_AFTER_REPAIR: 'Return After Repair',
    DISPOSAL_TRANSFER: 'Disposal Transfer',
};

export const movementTypeLabel = (type?: string): string =>
    (type && movementTypeLabels[type as MovementType]) || type || '—';

/** Movement types a user can initiate directly from the create form (store-to-store / to-user). */
export const creatableMovementTypes: { value: MovementType; label: string; description: string }[] = [
    { value: 'REPLENISHMENT', label: 'Replenishment', description: 'Stock a branch from Head Office' },
    { value: 'DEPARTMENT_TRANSFER', label: 'Department Transfer', description: 'Reallocate between departments / users' },
    { value: 'ISSUANCE_FULFILLMENT', label: 'Issuance Fulfillment', description: 'Fulfil an approved request across locations' },
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

/** Whether the movement is awaiting dispatch (inter-location, approved and not yet shipped). */
export const canDispatch = (m: { movementCategory?: string; status?: string }) =>
    m.movementCategory === 'INTER_LOCATION' && m.status === 'INITIATED';

export const canMarkInTransit = (m: { status?: string }) => m.status === 'DISPATCHED';

/** Inter-location movements are received after dispatch / transit. */
export const canReceive = (m: { movementCategory?: string; status?: string }) =>
    m.movementCategory === 'INTER_LOCATION' && (m.status === 'DISPATCHED' || m.status === 'IN_TRANSIT');

/** Intra-location movements complete in one step (once approved / initiated). */
export const canComplete = (m: { movementCategory?: string; status?: string }) =>
    m.movementCategory === 'INTRA_LOCATION' && (m.status === 'INITIATED' || m.status === 'RECEIVED');

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

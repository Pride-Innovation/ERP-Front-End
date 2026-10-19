/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

export type StockCountStatus =
    | 'DRAFT'
    | 'IN_PROGRESS'
    | 'SUBMITTED'
    | 'APPROVED'
    | 'POSTED'
    | 'CANCELLED';

export type AdjustmentReason =
    | 'MISCOUNT'
    | 'DAMAGED'
    | 'LOST_OR_STOLEN'
    | 'EXPIRED'
    | 'FOUND'
    | 'DATA_ENTRY_ERROR'
    /** Raised by deleting a stock order, never chosen on a count sheet. */
    | 'STOCK_REVERSAL'
    | 'OTHER';

export const ADJUSTMENT_REASONS: { value: AdjustmentReason; label: string; hint: string }[] = [
    { value: 'MISCOUNT', label: 'Miscount', hint: 'The earlier figure was wrong; nothing physically lost' },
    { value: 'DAMAGED', label: 'Damaged', hint: 'Physically present but unusable' },
    { value: 'LOST_OR_STOLEN', label: 'Lost or stolen', hint: 'Missing with no explanation' },
    { value: 'EXPIRED', label: 'Expired', hint: 'Past its usable date' },
    { value: 'FOUND', label: 'Found', hint: 'More on the shelf than recorded' },
    { value: 'DATA_ENTRY_ERROR', label: 'Data entry error', hint: 'A keying or posting mistake elsewhere' },
    { value: 'OTHER', label: 'Other', hint: 'A note is required' },
];

/**
 * How a reason reads in the adjustment history. Wider than the dropdown above: a reversal is written
 * by deleting a stock order, belongs to no count, and must not be offered to a counter.
 */
export const adjustmentReasonLabel = (reason: AdjustmentReason): string =>
    reason === 'STOCK_REVERSAL'
        ? 'Stock order reversal'
        : ADJUSTMENT_REASONS.find((r) => r.value === reason)?.label ?? reason;

export interface IStockCountLine {
    lineId: number;
    commodityId: number;
    commodityName: string;
    assetTypeName?: string | null;
    unit?: string | null;
    /** Null while a blind count is still being counted — revealed at review. */
    systemQuantity?: number | null;
    countedQuantity?: number | null;
    variance?: number | null;
    reason?: AdjustmentReason | null;
    note?: string | null;
    recountRequired: boolean;
    countedAt?: string | null;
}

export interface IStockCount {
    id: number;
    reference: string;
    storeId: number;
    storeName: string;
    assetTypeName?: string | null;
    status: StockCountStatus;
    blind: boolean;
    /** Who counted — what the sheet compares against to mirror "never approved by its counter". */
    countedById?: number | null;
    countedByName?: string | null;
    approvedByName?: string | null;
    submittedAt?: string | null;
    approvedAt?: string | null;
    postedAt?: string | null;
    notes?: string | null;
    reviewRemarks?: string | null;
    totalLines: number;
    countedLines: number;
    linesWithVariance: number;
    netUnitVariance: number;
    readyToSubmit: boolean;
    lines: IStockCountLine[];
}

export interface IStockAdjustment {
    id: number;
    storeName?: string | null;
    commodityName?: string | null;
    quantityDelta: number;
    quantityBefore: number;
    quantityAfter: number;
    reason: AdjustmentReason;
    note?: string | null;
    countReference?: string | null;
    postedAt: string;
}

export interface IVarianceReport {
    byReason: { reason: AdjustmentReason; lines: number; netUnits: number }[];
    adjustments: IStockAdjustment[];
    totalLines: number;
    unitsWrittenUp: number;
    unitsWrittenDown: number;
}

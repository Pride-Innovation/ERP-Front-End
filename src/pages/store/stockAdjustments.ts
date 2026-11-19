/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import moment from 'moment';
import { toast } from 'react-toastify';
import axiosInstance from '../../core/apis/axiosInstance';
import { exportListPdf, ListPdfColumn } from '../../utils/pdf/listPdf';
import { exportListCsv, exportListExcel } from '../../utils/exports/listSheet';
import {
    applyExportColumns,
    loadExportColumnConfig,
    readViewerChoice,
    resolveExportColumns,
} from '../../utils/exports/exportColumns';
import { AdjustmentReason, IStockAdjustment, IVarianceReport, adjustmentReasonLabel } from './stockTakeInterface';

/**
 * The stock take page's Adjustment History: its filters, its requests, and its export.
 *
 * <p>The server narrows the history to the viewer's stores first, then filters, totals and pages it
 * (`GET /stock-adjustments`). Nothing here decides visibility.
 */

export interface IAdjustmentFilters {
    storeId: string;
    branchId: string;
    reason: '' | AdjustmentReason;
    assetTypeId: string;
    search: string;
    /** `YYYY-MM-DD`, from a date box; widened to the whole day when sent. */
    from: string;
    to: string;
}

export const EMPTY_ADJUSTMENT_FILTERS: IAdjustmentFilters = {
    storeId: '', branchId: '', reason: '', assetTypeId: '', search: '', from: '', to: '',
};

/** The largest page the server returns; also what an export reads. */
export const ADJUSTMENT_EXPORT_LIMIT = 5000;

/**
 * The query parameters `GET /stock-adjustments` declares - and only those, so none is dropped
 * silently (trap #2). Dates go as local wall-clock times covering the whole day: `toISOString()`
 * would send UTC, which Spring re-reads as local and shifts by three hours, and a bare date would
 * stop "to" at midnight and lose the last day.
 */
export const toAdjustmentParams = (
    f: IAdjustmentFilters, pageNumber: number, pageSize: number,
): Record<string, string | number> => {
    const params: Record<string, string | number> = { pageNumber, pageSize };
    if (f.storeId) params.storeId = Number(f.storeId);
    if (f.branchId) params.branchId = Number(f.branchId);
    if (f.reason) params.reason = f.reason;
    if (f.assetTypeId) params.assetTypeId = Number(f.assetTypeId);
    if (f.search.trim()) params.search = f.search.trim();
    if (f.from) params.from = `${f.from}T00:00:00`;
    if (f.to) params.to = `${f.to}T23:59:59`;
    return params;
};

/** One page of the history. Throws on failure, so a refusal is never mistaken for "no adjustments". */
export const fetchAdjustmentPage = async (params: Record<string, string | number>): Promise<IVarianceReport> => {
    const res = await axiosInstance.get('stock-adjustments', { params });
    if (res.status !== 200 || !Array.isArray(res.data?.adjustments)) {
        throw new Error('The adjustment history was not readable');
    }
    return res.data as IVarianceReport;
};

/** The active filters as label/value pairs - printed on the PDF, so a saved file says what it holds. */
export const describeAdjustmentFilters = (
    f: IAdjustmentFilters, report: IVarianceReport | null,
): Array<{ label: string; value: string }> => {
    const strip: Array<{ label: string; value: string }> = [];
    const store = report?.storeOptions?.find((s) => String(s.id) === f.storeId);
    const branch = report?.storeOptions?.find((s) => String(s.branchId) === f.branchId);
    const category = report?.categoryOptions?.find((c) => String(c.id) === f.assetTypeId);
    if (f.storeId) strip.push({ label: 'Store', value: store?.name ?? f.storeId });
    if (f.branchId) strip.push({ label: 'Branch', value: branch?.branchName ?? f.branchId });
    if (f.reason) strip.push({ label: 'Reason', value: adjustmentReasonLabel(f.reason) });
    if (f.assetTypeId) strip.push({ label: 'Category', value: category?.name ?? f.assetTypeId });
    if (f.search.trim()) strip.push({ label: 'Commodity', value: f.search.trim() });
    if (f.from || f.to) {
        const day = (d: string) => moment(d).format('DD MMM YYYY');
        strip.push({ label: 'Posted', value: `${f.from ? day(f.from) : 'any time'} – ${f.to ? day(f.to) : 'today'}` });
    }
    return strip;
};

// ── Export ──────────────────────────────────────────────────────────────────────────────────────

const TABLE_KEY = 'stockAdjustments';
const DOCUMENT_TITLE = 'Stock Adjustment History';

/** Defined once, so a column added for the PDF cannot go missing from the spreadsheet. */
const COLUMNS: ListPdfColumn[] = [
    { title: 'Posted', dataKey: 'postedAt' },
    { title: 'Commodity', dataKey: 'commodity' },
    { title: 'Category', dataKey: 'category' },
    { title: 'Store', dataKey: 'store' },
    { title: 'Branch', dataKey: 'branch' },
    { title: 'Before', dataKey: 'before' },
    { title: 'After', dataKey: 'after' },
    { title: 'Change', dataKey: 'change' },
    { title: 'Reason', dataKey: 'reason' },
    { title: 'Note', dataKey: 'note' },
    { title: 'Count', dataKey: 'count' },
    { title: 'Posted by', dataKey: 'postedBy' },
];

export const buildAdjustmentExportRows = (rows: IStockAdjustment[]): Array<Record<string, any>> =>
    rows.map((a) => ({
        postedAt: a.postedAt ? moment(a.postedAt).format('DD MMM YYYY HH:mm') : '',
        commodity: a.commodityName ?? '',
        category: a.assetTypeName ?? '',
        store: a.storeName ?? '',
        branch: a.branchName ?? '',
        before: a.quantityBefore,
        after: a.quantityAfter,
        change: a.quantityDelta > 0 ? `+${a.quantityDelta}` : String(a.quantityDelta),
        reason: adjustmentReasonLabel(a.reason),
        note: a.note ?? '',
        // A reversal comes from a deleted stock order and belongs to no count.
        count: a.countReference ?? '',
        postedBy: a.postedByName ?? '',
    }));

export type AdjustmentExportFormat = 'pdf' | 'excel' | 'csv';

/**
 * Exports every adjustment matching the current filters - not the page on screen. It refetches,
 * because writing out the visible page would produce a file that looks complete and is not; where the
 * ceiling cuts it short, the user is told how much they got.
 *
 * @returns false when there was nothing to export
 */
export const exportAdjustments = async (
    format: AdjustmentExportFormat,
    filters: IAdjustmentFilters,
    report: IVarianceReport | null,
): Promise<boolean> => {
    const all = await fetchAdjustmentPage(toAdjustmentParams(filters, 0, ADJUSTMENT_EXPORT_LIMIT));
    if (all.adjustments.length === 0) {
        toast.warning('There are no adjustments matching the current filters to export.');
        return false;
    }
    if (all.totalLines > all.adjustments.length) {
        toast.info(`Exporting the first ${all.adjustments.length.toLocaleString()} of `
            + `${all.totalLines.toLocaleString()} adjustments. Narrow the filters for the rest.`);
    }

    const config = await loadExportColumnConfig();
    const columns = applyExportColumns(COLUMNS, resolveExportColumns(TABLE_KEY, config, readViewerChoice(TABLE_KEY)));
    const rows = buildAdjustmentExportRows(all.adjustments);

    if (format === 'pdf') {
        await exportListPdf(columns, rows, DOCUMENT_TITLE, { filters: describeAdjustmentFilters(filters, report) });
    } else if (format === 'excel') {
        exportListExcel(columns, rows, DOCUMENT_TITLE);
    } else {
        exportListCsv(columns, rows, DOCUMENT_TITLE);
    }
    return true;
};

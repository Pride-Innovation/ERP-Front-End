/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

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

/**
 * A store's "Assets Held" table: its row shape, its requests, and its export.
 *
 * <p>Filtering, sorting and paging all happen on the server, after the server has narrowed the
 * store to what the viewer may see (`GET /inventory/stores/{id}/assets/page`). Nothing here decides
 * visibility, and nothing should: a browser that narrowed its own view would be trusting itself.
 */

/** One row, as `StoreAssetRow` sends it. */
export interface IStoreAssetRow {
    id: number;
    assetName?: string | null;
    model?: string | null;
    assetTypeId?: number | null;
    assetTypeName?: string | null;
    engravedNumber?: string | null;
    serialNumber?: string | null;
    statusCode?: string | null;
    statusName?: string | null;
    loanable: boolean;
    holdingBranchName?: string | null;
    originBranchId?: number | null;
    originBranchName?: string | null;
    /** The store actually holding it - on a branch's Admin page, possibly the Head Office Admin store. */
    storeId?: number | null;
    storeName?: string | null;
}

export interface IStoreAssetPage {
    content: IStoreAssetRow[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    /** Loanable assets across the whole filtered set, not just this page. */
    loanableTotal: number;
}

export interface IStoreAssetOption { value: string; label: string }

export interface IStoreAssetFilterOptions {
    categories: IStoreAssetOption[];
    statuses: IStoreAssetOption[];
    /** Empty unless the "Sent from" filter applies: such a store, viewed by someone who sees every branch. */
    originBranches: IStoreAssetOption[];
    /**
     * Whether this store receives assets from other branches - IT, Disposal, and the Head Office
     * Admin store where Admin-routed repairs are held - so the table shows "Sent From". The server
     * decides; optional because a backend older than this page does not send it.
     */
    originColumn?: boolean;
    /**
     * Whether the table also lists the branch's assets away at the Head Office Admin store for repair
     * - true only on a branch's own Admin store, asked for with `includeAwayForRepair`. Then each row
     * says where it is held.
     */
    awayIncluded?: boolean;
}

/** A store as the directory describes it - the fields this table needs. */
export interface IStoreSummary {
    id: number;
    name?: string;
    locationId?: number | null;
    departmentId?: number | null;
}

/**
 * The branch's own location-level store out of a directory listing - the one with no department.
 * A department's store at the same branch is a different shelf, and taking the first row could land
 * on it.
 */
export const pickLocationStore = (stores: IStoreSummary[]): IStoreSummary | null =>
    stores.find((s) => s.departmentId == null) ?? stores[0] ?? null;

/** What the filter bar holds. `''` means "no restriction" for every field. */
export interface IStoreAssetFilters {
    search: string;
    assetTypeId: string;
    statusCode: string;
    loanable: '' | 'true' | 'false';
    originBranchId: string;
}

export const EMPTY_STORE_ASSET_FILTERS: IStoreAssetFilters = {
    search: '', assetTypeId: '', statusCode: '', loanable: '', originBranchId: '',
};

export interface IStoreAssetSort { by: string; direction: 'ASC' | 'DESC' }

/** Same ceiling the server enforces; an export asks for everything up to it. */
export const STORE_ASSET_EXPORT_LIMIT = 5000;

/**
 * The query string for one page. Empty fields are dropped rather than sent blank: every key here is
 * declared on the endpoint, and keeping it that way is what stops a filter looking active while the
 * server ignores it.
 */
export const toStoreAssetParams = (
    filters: IStoreAssetFilters,
    pageNumber: number,
    pageSize: number,
    sort: IStoreAssetSort,
    includeAwayForRepair = false,
): Record<string, string | number | boolean> => {
    const params: Record<string, string | number | boolean> = {
        pageNumber,
        pageSize,
        sortBy: sort.by,
        sortDirection: sort.direction,
    };
    // Only sent when asked for; the server honours it on a branch's own Admin store and ignores it elsewhere.
    if (includeAwayForRepair) params.includeAwayForRepair = true;
    if (filters.search.trim()) params.search = filters.search.trim();
    if (filters.assetTypeId) params.assetTypeId = Number(filters.assetTypeId);
    if (filters.statusCode) params.statusCode = filters.statusCode;
    if (filters.loanable) params.loanable = filters.loanable === 'true';
    if (filters.originBranchId) params.originBranchId = Number(filters.originBranchId);
    return params;
};

/** Throws on anything that is not a page, so a refusal reaches the caller rather than reading as empty. */
export const fetchStoreAssetPage = async (
    storeId: number,
    params: Record<string, string | number | boolean>,
): Promise<IStoreAssetPage> => {
    const res = await axiosInstance.get(`inventory/stores/${storeId}/assets/page`, { params });
    if (res.status !== 200 || !Array.isArray(res.data?.content)) {
        throw new Error('The store assets response was not a page');
    }
    return res.data as IStoreAssetPage;
};

export const fetchStoreAssetFilterOptions = async (
    storeId: number,
    includeAwayForRepair = false,
): Promise<IStoreAssetFilterOptions> => {
    const res = await axiosInstance.get(`inventory/stores/${storeId}/assets/filter-options`, {
        params: includeAwayForRepair ? { includeAwayForRepair: true } : {},
    });
    if (res.status !== 200 || !Array.isArray(res.data?.categories)) {
        throw new Error('The store asset filter options were not readable');
    }
    return res.data as IStoreAssetFilterOptions;
};

/** The active filters as readable label/value pairs - printed on the PDF so a saved file says what it is. */
export const describeStoreAssetFilters = (
    filters: IStoreAssetFilters,
    options: IStoreAssetFilterOptions | null,
): Array<{ label: string; value: string }> => {
    const labelOf = (list: IStoreAssetOption[] | undefined, value: string) =>
        list?.find((o) => o.value === value)?.label ?? value;
    const strip: Array<{ label: string; value: string }> = [];
    if (filters.search.trim()) strip.push({ label: 'Search', value: filters.search.trim() });
    if (filters.assetTypeId) strip.push({ label: 'Category', value: labelOf(options?.categories, filters.assetTypeId) });
    if (filters.statusCode) strip.push({ label: 'Status', value: labelOf(options?.statuses, filters.statusCode) });
    if (filters.loanable) strip.push({ label: 'Loanable', value: filters.loanable === 'true' ? 'Yes' : 'No' });
    if (filters.originBranchId) {
        strip.push({ label: 'Sent from', value: labelOf(options?.originBranches, filters.originBranchId) });
    }
    return strip;
};

// ── Export ──────────────────────────────────────────────────────────────────────────────────────

const TABLE_KEY = 'storeAssets';

/** Defined once, so a column added for the PDF cannot go missing from the spreadsheet. */
const COLUMNS: ListPdfColumn[] = [
    { title: 'Asset', dataKey: 'assetName' },
    { title: 'Model', dataKey: 'model' },
    { title: 'Category', dataKey: 'category' },
    { title: 'Engraved No.', dataKey: 'engravedNumber' },
    { title: 'Serial No.', dataKey: 'serialNumber' },
    { title: 'Status', dataKey: 'status' },
    { title: 'Loanable', dataKey: 'loanable' },
    { title: 'Sent From', dataKey: 'sentFrom' },
    { title: 'Held At', dataKey: 'heldAt' },
    { title: 'Location', dataKey: 'location' },
];

export const buildStoreAssetExportRows = (rows: IStoreAssetRow[]): Array<Record<string, any>> =>
    rows.map((r) => ({
        assetName: r.assetName ?? '',
        model: r.model ?? '',
        category: r.assetTypeName ?? '',
        engravedNumber: r.engravedNumber ?? '',
        serialNumber: r.serialNumber ?? '',
        status: r.statusName ?? '',
        loanable: r.loanable ? 'Yes' : 'No',
        sentFrom: r.originBranchName ?? '',
        heldAt: r.storeName ?? '',
        location: r.holdingBranchName ?? '',
    }));

export type StoreAssetExportFormat = 'pdf' | 'excel' | 'csv';

/** Which of the conditional columns this table shows - the file carries the same ones. */
export interface IStoreAssetExportShape {
    /** "Sent From": stores other branches send assets into, viewed by someone who sees every branch. */
    includeOrigin: boolean;
    /** Ask for the branch's away-for-repair rows too: a branch's own Admin store. */
    includeAway: boolean;
    /** "Held At": wherever the table shows it - the Admin page's mixed rows, or a branch on a shared store. */
    includeHeldAt?: boolean;
}

/**
 * Exports every asset matching the current filters - not the page on screen.
 *
 * <p>It refetches, because writing out the visible page would produce a file that looks complete
 * and is not. Where the ceiling cuts it short, the user is told how much they got.
 *
 * <p>The conditional columns go in the file only where the table shows them: "Sent From" in a
 * branch's own Admin store, or "Held At" anywhere else, would be blank or identical on every row,
 * which reads as missing data rather than as not applying.
 *
 * @returns false when there was nothing to export
 */
export const exportStoreAssets = async (
    format: StoreAssetExportFormat,
    storeId: number,
    filters: IStoreAssetFilters,
    sort: IStoreAssetSort,
    title: string,
    options: IStoreAssetFilterOptions | null,
    shape: IStoreAssetExportShape = { includeOrigin: true, includeAway: false },
): Promise<boolean> => {
    const page = await fetchStoreAssetPage(
        storeId, toStoreAssetParams(filters, 0, STORE_ASSET_EXPORT_LIMIT, sort, shape.includeAway));

    if (page.content.length === 0) {
        toast.warning('There are no assets matching the current filters to export.');
        return false;
    }
    if (page.totalElements > page.content.length) {
        toast.info(`Exporting the first ${page.content.length.toLocaleString()} of `
            + `${page.totalElements.toLocaleString()} matches. Narrow the filters for the rest.`);
    }

    const config = await loadExportColumnConfig();
    const columns = applyExportColumns(
        COLUMNS, resolveExportColumns(TABLE_KEY, config, readViewerChoice(TABLE_KEY)))
        .filter((c) => (shape.includeOrigin || c.dataKey !== 'sentFrom')
            && ((shape.includeHeldAt ?? shape.includeAway) || c.dataKey !== 'heldAt'));
    const rows = buildStoreAssetExportRows(page.content);

    if (format === 'pdf') {
        await exportListPdf(columns, rows, title, { filters: describeStoreAssetFilters(filters, options) });
    } else if (format === 'excel') {
        exportListExcel(columns, rows, title);
    } else {
        exportListCsv(columns, rows, title);
    }
    return true;
};

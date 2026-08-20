/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from '../../../core/apis/axiosInstance';
import {
    IAssetImportResult, IAssetImportRowError, IAssetImportTemplate,
} from '../interface';

/** Everything needed to build the template for one category. Throws so the caller can report it. */
export const fetchAssetImportTemplateService = async (
    assetTypeId: number,
): Promise<IAssetImportTemplate> => {
    const res = await axiosInstance.get(`assets/import-template/${assetTypeId}`);
    return res.data;
};

/** Normalises one batch's response, tolerating a shape older than the rewritten importer. */
const readBatch = (payload: any, rows: any[], offset: number): IAssetImportResult => {
    const rawErrors = Array.isArray(payload?.errors) ? payload.errors : [];
    const errors: IAssetImportRowError[] = rawErrors.map((e: any, i: number) => ({
        // The server numbers rows within its batch. Adding the offset puts them back on the
        // spreadsheet's own numbering, which is the only numbering the user can act on.
        row: typeof e?.row === 'number' ? e.row : offset + i + 1,
        assetName: e?.assetName ?? null,
        engravedNumber: e?.engravedNumber ?? null,
        serialNumber: e?.serialNumber ?? null,
        error: e?.error ?? 'Unknown error',
    }));

    return {
        success: Boolean(payload?.success),
        total: Number(payload?.total ?? rows.length),
        inserted: Number(payload?.inserted ?? 0),
        failed: Number(payload?.failed ?? errors.length),
        errors,
    };
};

/**
 * Uploads a parsed spreadsheet, in batches, and returns the combined outcome.
 *
 * <p>Sequential rather than parallel, deliberately. The duplicate check spans the whole register, so
 * two batches carrying the same engraved number must not be validated at the same time — running
 * them concurrently would let both through. Sequential batches also keep the progress count honest
 * and avoid several long queries landing on the database at once.
 *
 * <p>A batch that fails outright — a timeout, a 500 — stops the run rather than pressing on. The
 * rows already committed stay committed and are reported, and the caller can correct and re-upload
 * safely because duplicates are refused.
 *
 * @param onProgress called with rows attempted so far, for the progress bar
 */
export const bulkImportAssetsService = async (
    rows: any[],
    assetTypeId: number,
    batchSize: number,
    onProgress?: (done: number, total: number) => void,
): Promise<IAssetImportResult> => {
    const combined: IAssetImportResult = {
        success: false, total: rows.length, inserted: 0, failed: 0, errors: [],
    };

    for (let offset = 0; offset < rows.length; offset += batchSize) {
        const batch = rows.slice(offset, offset + batchSize);
        const form = new FormData();
        form.append('assets', JSON.stringify(batch));
        form.append('assetTypeID', String(assetTypeId));

        let payload: any;
        try {
            const res = await axiosInstance.post('assets/bulk-insert', form);
            payload = res.data;
        } catch (error: any) {
            // Everything from this batch onward is unaccounted for. Say so precisely rather than
            // reporting the remaining rows as failures — they were never attempted.
            const detail = error?.response?.data?.detail
                ?? error?.response?.data?.message
                ?? error?.message
                ?? 'the request failed';
            combined.failed += batch.length;
            combined.errors.push({
                row: offset + 1,
                assetName: null,
                engravedNumber: null,
                serialNumber: null,
                error: `Upload stopped at row ${offset + 1}: ${detail}. `
                    + 'Rows before this point were imported; the rest were not attempted.',
            });
            combined.success = combined.inserted > 0;
            return combined;
        }

        const batchResult = readBatch(payload, batch, offset);
        combined.inserted += batchResult.inserted;
        combined.failed += batchResult.failed;
        combined.errors.push(...batchResult.errors);

        onProgress?.(Math.min(offset + batchSize, rows.length), rows.length);
    }

    combined.success = combined.inserted > 0;
    return combined;
};

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { assetImportHeaders, ASSET_IMPORT_COLUMNS, stateOf } from './assetImportColumns';

/**
 * Guards which columns actually reach the import sheet.
 *
 * The Assigned To column was defined from the start and still never appeared, because the category's
 * `fieldConfig` marked it hidden and nothing checked what the generator emitted. Defining a column
 * is not the same as shipping one, and this is the difference.
 */
describe('asset import columns', () => {

    /**
     * The create form hides Assigned To and Status because separate actions set them after an asset
     * exists. An import has no such second pass — nobody is going to open two thousand assets and
     * assign each one by hand — so `hidden` must not carry over from the form to the sheet.
     */
    it('keeps Assigned To and Status even when the category hides them on the form', () => {
        const headers = assetImportHeaders({
            assignedTo: 'hidden',
            assetStatus: 'hidden',
        });

        expect(headers).toContain('Assigned To');
        expect(headers).toContain('Status');
    });

    it('still lets a category make Assigned To required', () => {
        const spec = ASSET_IMPORT_COLUMNS.find((c) => c.header === 'Assigned To')!;
        expect(stateOf(spec, { assignedTo: 'required' })).toBe('required');
        expect(stateOf(spec, { assignedTo: 'hidden' })).toBe('optional');
        expect(stateOf(spec, null)).toBe('optional');
    });

    /** Without these two the importer rejects every row, so no configuration may remove them. */
    it('never drops the columns the importer requires', () => {
        const configs: Array<Record<string, string> | null> = [
            { assetName: 'hidden', engravedNumber: 'hidden', branch: 'hidden' },
            null,
            {},
        ];
        configs.forEach((config) => {
            const headers = assetImportHeaders(config);
            expect(headers).toContain('Asset Name');
            expect(headers).toContain('Engraved Number');
            expect(headers).toContain('Location');
        });
    });

    /** RAM on a Fleet sheet is noise; on IT Equipment it is the point. */
    it('includes the IT block only where the category asks for it', () => {
        expect(assetImportHeaders(null)).not.toContain('RAM');
        expect(assetImportHeaders({ ram: 'optional' })).toContain('RAM');
        expect(assetImportHeaders({ macAddress: 'required' })).toContain('MAC Address');
    });

    /**
     * Header text is the contract with the backend: FileUploadButton camel-cases it into the key
     * `BulkAssetDTO` binds to. A header carrying punctuation or a bracketed hint camel-cases to
     * something that binds to nothing, and the column silently imports as blank — so the headers are
     * pinned against the DTO's field names rather than merely being checked for tidiness.
     */
    it('produces headers that camel-case to the backend field names', () => {
        const toCamelCase = (str: string): string => {
            const words = str.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
            return words
                .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
                .join('');
        };

        // Every field on BulkAssetDTO.
        const dtoFields = [
            'no', 'assetName', 'engravedNumber', 'serialNumber', 'tagName', 'commodity', 'supplier',
            'location', 'assignedTo', 'status', 'dateReceived', 'purchaseCost', 'costOfTheAsset',
            'netBookValue', 'depreciationRate', 'unitOfMeasure', 'make', 'model', 'description',
            'hostname', 'ipAddress', 'macAddress', 'ram', 'cpuSpeed', 'hardDiskSize', 'interfaceType',
        ];

        ASSET_IMPORT_COLUMNS.forEach((column) => {
            expect(dtoFields).toContain(toCamelCase(column.header));
        });
    });
});

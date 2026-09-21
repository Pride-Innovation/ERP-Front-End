/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * Which columns the asset import sheet carries, and which of them are required.
 *
 * <p>Kept apart from the workbook generator so this is pure data and one pure function — no ExcelJS,
 * no network. That is what makes it testable, and the reason it is now tested: the Assigned To column
 * was defined here from the start and still never reached the sheet, because the category's
 * `fieldConfig` marked it hidden and nothing checked what the generator actually emitted.
 */

export type FieldState = 'required' | 'optional' | 'hidden';

export interface ColumnSpec {
    /** Header text. MUST camel-case to the matching BulkAssetDTO field — see the note below. */
    header: string;
    /** Key in `fieldConfig`. Omitted for columns the form does not configure. */
    configKey?: string;
    width: number;
    /** Required regardless of `fieldConfig` — the importer rejects the row without it. */
    alwaysRequired?: boolean;
    /**
     * Always on the sheet: `fieldConfig` may mark it required, but never hide it.
     *
     * <p>For the columns the create form deliberately leaves out because a separate action owns them
     * — assigning a holder, setting a status. Hiding those on a form is right; hiding them on an
     * import is not, because a migration records assets that already have a holder and a state, and
     * there is no second action anyone will run over two thousand rows afterwards.
     */
    alwaysOffered?: boolean;
    /** Hidden unless `fieldConfig` explicitly enables it (the IT-only block). */
    optIn?: boolean;
    /** Defined name of the dropdown source, when the column has one. */
    list?: 'BranchList' | 'SupplierList' | 'CommodityList' | 'StatusList' | 'StaffList';
    /** Excel number format — dates and money read wrongly without one. */
    numFmt?: string;
    /** Shown in the cell's input prompt, and on the Notes sheet. */
    hint?: string;
    sample?: string | number;
}

/*
 * Header text is load-bearing.
 *
 * FileUploadButton camel-cases each header to produce the JSON key the backend binds to
 * (`BulkAssetDTO`). "Cost of the Asset" becomes costOfTheAsset; "IP Address" becomes ipAddress. That
 * also means punctuation and bracketed hints break the mapping — "Location / Branch" would camel-case
 * to `locationBranch`, which binds to nothing and imports as blank. Hints therefore live in the cell
 * prompt and the Notes sheet, never in the header.
 */
export const ASSET_IMPORT_COLUMNS: ColumnSpec[] = [
    { header: 'No.', width: 6, hint: 'Row number. Used to point at this row if it fails.', sample: 1 },

    // ── Identity ─────────────────────────────────────────────────────────────
    { header: 'Asset Name', configKey: 'assetName', width: 28, alwaysRequired: true, sample: 'Dell Latitude 5540' },
    {
        header: 'Engraved Number', configKey: 'engravedNumber', width: 20, alwaysRequired: true,
        hint: 'The tag engraved on the item. Must be unique across the whole register.',
        sample: 'PBL/IT/0412',
    },
    {
        header: 'Serial Number', configKey: 'serialNumber', width: 22,
        hint: "The manufacturer's serial. Must be unique where given.",
        sample: 'JHK4LM3',
    },
    { header: 'Tag Name', width: 18, hint: 'Any internal label used alongside the engraved number.' },

    // ── Classification ───────────────────────────────────────────────────────
    { header: 'Commodity', width: 26, list: 'CommodityList', hint: 'Pick from the list. Only commodities in this category are offered.' },
    { header: 'Supplier', configKey: 'supplier', width: 26, list: 'SupplierList', hint: 'Pick from the list.' },

    // ── Placement ────────────────────────────────────────────────────────────
    {
        header: 'Location', configKey: 'branch', width: 24, alwaysRequired: true, list: 'BranchList',
        hint: 'The branch holding the asset. If Assigned To is filled in, that person\'s branch wins.',
        sample: 'Head Office',
    },
    {
        header: 'Assigned To', configKey: 'assignedTo', width: 30, list: 'StaffList', alwaysOffered: true,
        hint: 'Staff number or email of the holder. Leave blank if the asset is in a store.',
    },
    {
        header: 'Status', configKey: 'assetStatus', width: 24, list: 'StatusList', alwaysOffered: true,
        hint: 'Leave blank for "Require Update", which flags the asset as needing its details completed.',
    },

    // ── Commercial ───────────────────────────────────────────────────────────
    {
        header: 'Date Received', configKey: 'dateReceipt', width: 16, numFmt: 'dd/mm/yyyy',
        hint: 'dd/mm/yyyy.', sample: '01/03/2023',
    },
    { header: 'Purchase Cost', configKey: 'purchaseCost', width: 16, numFmt: '#,##0.00', hint: 'Numbers only — no UGX prefix needed.' },
    { header: 'Cost of the Asset', configKey: 'costOfTheAsset', width: 18, numFmt: '#,##0.00' },
    { header: 'Net Book Value', configKey: 'netValueB', width: 16 },
    { header: 'Depreciation Rate', configKey: 'assetDepreciationRate', width: 16, hint: 'e.g. 25% or 0.25.' },
    { header: 'Unit of Measure', configKey: 'unitOfMeasure', width: 16, sample: 'Each' },

    // ── Descriptive ──────────────────────────────────────────────────────────
    { header: 'Make', configKey: 'make', width: 18, sample: 'Dell' },
    { header: 'Model', configKey: 'model', width: 20, sample: 'Latitude 5540' },
    { header: 'Description', configKey: 'description', width: 34 },

    // ── IT-specific: only appear where the category enables them ─────────────
    { header: 'Hostname', configKey: 'hostname', width: 20, optIn: true },
    { header: 'IP Address', configKey: 'ipAddress', width: 16, optIn: true, hint: 'IPv4, e.g. 192.0.2.44.' },
    { header: 'MAC Address', configKey: 'macAddress', width: 20, optIn: true, hint: 'Any separator; stored as 00:1B:44:11:3A:B7.' },
    { header: 'RAM', configKey: 'ram', width: 12, optIn: true, sample: '16GB' },
    { header: 'CPU Speed', configKey: 'cpuSpeed', width: 14, optIn: true },
    { header: 'Hard Disk Size', configKey: 'hardDiskSize', width: 16, optIn: true },
    { header: 'Interface Type', configKey: 'interfaceType', width: 16, optIn: true },
];

export const stateOf = (
    spec: ColumnSpec,
    config: Record<string, string> | null | undefined,
): FieldState => {
    if (spec.alwaysRequired) return 'required';

    const configured = spec.configKey ? config?.[spec.configKey] : undefined;
    if (configured === 'required' || configured === 'optional' || configured === 'hidden') {
        // An `alwaysOffered` column honours "required" but ignores "hidden".
        if (configured === 'hidden' && spec.alwaysOffered) return 'optional';
        return configured;
    }

    // Unconfigured: the IT block stays out unless a category asks for it, everything else is offered
    // as optional. Better to give someone a column they leave blank than to omit one they needed.
    return spec.optIn ? 'hidden' : 'optional';
};

/** The columns this category's sheet carries, in order. */
export const visibleAssetImportColumns = (
    config: Record<string, string> | null | undefined,
): ColumnSpec[] => ASSET_IMPORT_COLUMNS.filter((c) => stateOf(c, config) !== 'hidden');

/** Header list for the failed-rows workbook, so a correction file matches the template. */
export const assetImportHeaders = (
    config: Record<string, string> | null | undefined,
): string[] => visibleAssetImportColumns(config).map((c) => c.header);

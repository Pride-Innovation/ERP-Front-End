/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * Every table that can be exported, under a name that stays the same.
 *
 * <h2>Why a registry exists at all</h2>
 * The obvious identity for a table is the `module` string it already passes to `TableComponent`, and
 * that string cannot do the job:
 *
 * - The assets page passes **the asset category's name** (`moduleName={currentAssetType.name}`), so
 *   one table arrives under twelve identities — "Computers", "Vehicle/Fleet",
 *   "Building & Construction" … Configure it once and eleven other categories stay unconfigured.
 * - **Both** the asset-request tabs and the fleet-requisition tabs call themselves `"request"`, so
 *   two unrelated tables arrive under one name. The same collision nearly emptied the transport row
 *   menu when the request action rules were unified.
 *
 * A configuration keyed on `module` would therefore fragment one table and merge two others. These
 * keys are chosen once, never derived, and never change — they are what the saved configuration
 * points at.
 *
 * <h2>Why the columns are listed by hand</h2>
 * They cannot be discovered honestly. The row objects are built by spreading the entity
 * (`...fielsdata`) and the row interfaces end in `[key: string]: any`, so what a table actually
 * carries is whatever its mapper happened to leave behind — which is why the requests export ships a
 * **"Requester ID"** column that exists only so the row menu can tell whose request it is.
 *
 * <p>Listing them is the curation this feature is for. A column not named here never reaches a file,
 * which is what turns an eighteen-column wall into a readable report.
 */
export interface ExportColumn {
    /** The row field this column reads. Must match the key the table's mapper produces. */
    key: string;
    /** Heading in the file. Written out rather than camel-cased, so "Lpo Number" reads as "LPO Number". */
    label: string;
    /**
     * Whether this column is in the file when nobody has configured the table.
     *
     * <p>Everything defaults to on except columns that exist for the screen rather than the reader —
     * internal ids and the like. A table nobody has touched should still export something sensible.
     */
    defaultOn?: boolean;
}

export interface ExportTable {
    /** Stable identity. Stored in `export_column_config.table_key`; never derived from a label. */
    key: string;
    /** How the table is named in Settings. */
    title: string;
    /** Where it lives, so a long list in Settings can be grouped and scanned. */
    group: 'Assets' | 'Requests' | 'Inventory & Stores' | 'Movement' | 'People';
    columns: ExportColumn[];
}

/** Shorthand — most columns are simply on. */
const on = (key: string, label: string): ExportColumn => ({ key, label, defaultOn: true });
/** Available, but off until somebody asks for it. */
const off = (key: string, label: string): ExportColumn => ({ key, label, defaultOn: false });

export const EXPORT_TABLES: ExportTable[] = [
    {
        key: 'assets',
        title: 'Assets register',
        group: 'Assets',
        /*
         * One entry for all twelve categories. The page's `module` is the category name, so keying
         * on that would have meant configuring "Computers" and finding "Furniture" untouched — the
         * register is one table however it is filtered.
         */
        columns: [
            on('assetName', 'Asset name'),
            on('engravedNumber', 'Engraved number'),
            on('serialNumber', 'Serial number'),
            on('model', 'Model'),
            on('manufacturer', 'Manufacturer'),
            on('status', 'Status'),
            on('assignedTo', 'Assigned to'),
            on('location', 'Location'),
            on('dateReceived', 'Date received'),
            /*
             * No cost columns here, and that is not an omission.
             *
             * `buildAssetExportRows` destructures `purchaseCost` and `costOfTheAsset` *out* of the
             * row before spreading the rest, so neither ever reaches the export. Listing them would
             * put two ticks in Settings that quietly do nothing — worse than their absence, because
             * somebody would tick them, check the file, and conclude the feature is broken.
             *
             * If they are wanted in the file, the mapper has to carry them first.
             */
        ],
    },
    {
        key: 'assignmentHistory',
        title: 'Asset assignment history',
        group: 'Assets',
        columns: [
            on('user', 'Held by'),
            on('engravedNumber', 'Engraved number'),
            on('location', 'Location'),
            on('startDate', 'From'),
            on('endDate', 'To'),
        ],
    },
    {
        key: 'repairHistory',
        title: 'Asset repair history',
        group: 'Assets',
        columns: [
            on('repairStartDate', 'Repair started'),
            on('repairEndDate', 'Repair ended'),
            on('technician', 'Technician'),
            on('repairReason', 'Reason'),
        ],
    },
    {
        key: 'assetRequests',
        title: 'Asset requests',
        group: 'Requests',
        /*
         * Shared by all four tabs — All, Pending, Rejected, Issued. The tab says which slice you are
         * looking at, never what the file should contain, and four separate configurations would be
         * four places to keep in step.
         *
         * ── What this row actually carries, and why most of it is not here ──
         *
         * `buildRequestExportRows` spreads the whole request (`...fielsdata`), so the row arrives
         * with twenty keys and the unnarrowed file printed every one of them: Id, Name, Priority,
         * Commodities, Request Reports, Description, Create Date, Request Commodities, Current Unit,
         * Current Step Type, Is Branch Stationary, Asset Type Id, Asset Type, Attributes, Request
         * Date, Requested By, Approver, Requested From, Status, Requester ID.
         *
         * Eight of those are **objects or arrays** — `commodities`, `requestReports`,
         * `requestCommodities`, `currentUnit`, `assetType`, `attributes` — and a spreadsheet renders
         * an object as "[object Object]". Offering them would be offering a column that cannot print.
         *
         * Four more are internal: `requesterID` rides on the row so the row menu can tell whose
         * request it is, `assetTypeId` and `isBranchStationery` are routing flags, and `id` is the
         * database id — which *is* worth offering, as the reference number people quote.
         *
         * The rest are real choices and are here, most of them off until somebody wants them.
         */
        columns: [
            on('name', 'Request title'),
            on('requestDate', 'Requested on'),
            on('requestedBy', 'Requested by'),
            on('approver', 'Currently with'),
            on('requestedFrom', 'Branch'),
            on('priority', 'Priority'),
            on('status', 'Status'),
            off('id', 'Request no.'),
            off('description', 'Description'),
            off('createDate', 'Created'),
            off('currentStepType', 'Current stage'),
        ],
    },
    {
        key: 'transportRequests',
        title: 'Fleet requisitions',
        group: 'Requests',
        /* A different entity from the above, despite both calling themselves "request". */
        columns: [
            on('name', 'Request title'),
            on('requestDate', 'Requested on'),
            on('dateVehicleIsRequired', 'Vehicle required on'),
            on('timeVehicleIsRequired', 'Vehicle required at'),
            on('duration', 'Duration'),
            off('timeOfSubmissionOfRequest', 'Submitted at'),
        ],
    },
    {
        key: 'requestApprovals',
        title: 'Request approval trail',
        group: 'Requests',
        columns: [
            on('approver', 'Approver'),
            on('status', 'Decision'),
            on('createDate', 'Decided on'),
            on('comment', 'Comment'),
        ],
    },
    {
        key: 'storeBalances',
        title: 'Store stock',
        group: 'Inventory & Stores',
        columns: [
            on('name', 'Item'),
            on('unitOfMeasure', 'Unit of measure'),
            on('quantity', 'Quantity'),
            on('branch', 'Branch'),
            on('status', 'Stock level'),
            off('minLevel', 'Reorder at'),
        ],
    },
    {
        key: 'inventoryOrders',
        title: 'Stock orders',
        group: 'Inventory & Stores',
        columns: [
            on('date', 'Date'),
            on('supplier', 'Supplier'),
            on('Supply', 'Supply'),
            on('totalItemsOrdered', 'Items ordered'),
            on('totalItemsDelivered', 'Items delivered'),
            on('status', 'Status'),
            on('branch', 'Branch'),
        ],
    },
    {
        key: 'grnDocuments',
        title: 'GRN documents',
        group: 'Inventory & Stores',
        columns: [
            on('grnNumber', 'GRN number'),
            on('createDate', 'Created'),
            on('grnUploaded', 'Uploaded'),
            off('lastModified', 'Last modified'),
        ],
    },
    {
        key: 'movements',
        title: 'Movements register',
        group: 'Movement',
        /*
         * Fifteen columns, which is precisely the congestion this feature exists for: printed in
         * portrait they are unreadable, and most readers of this register want the first seven.
         */
        columns: [
            on('ref', 'Ref'),
            on('type', 'Type'),
            on('category', 'Category'),
            on('source', 'Source'),
            on('destination', 'Destination'),
            on('items', 'Items'),
            on('status', 'Status'),
            on('dispatchDate', 'Dispatch date'),
            off('courier', 'Courier'),
            off('plateNumber', 'Plate no'),
            off('trackingNumber', 'Tracking no'),
            off('expectedDelivery', 'Expected delivery'),
            off('receiptStatus', 'Receipt status'),
            off('initiatedBy', 'Initiated by'),
            off('created', 'Created'),
        ],
    },
    {
        key: 'consignments',
        title: 'Consignments',
        group: 'Movement',
        columns: [
            on('reference', 'Reference'),
            on('status', 'Status'),
            on('source', 'Source'),
            on('destination', 'Destination'),
            on('movements', 'Movements'),
            on('dispatched', 'Dispatched'),
            on('expectedDelivery', 'Expected delivery'),
            on('arrived', 'Arrived'),
            off('landingStore', 'Landing store'),
            off('courier', 'Courier'),
            off('plateNumber', 'Plate no'),
            off('trackingNumber', 'Tracking no'),
            off('openedBy', 'Opened by'),
            off('receivedBy', 'Received by'),
            off('opened', 'Opened'),
            off('remarks', 'Remarks'),
        ],
    },
    {
        key: 'users',
        title: 'Staff directory',
        group: 'People',
        columns: [
            on('name', 'Name'),
            on('staffNumber', 'Staff number'),
            on('email', 'Email'),
            on('dutyStation', 'Duty station'),
            on('availability', 'Availability'),
            on('status', 'Status'),
        ],
    },
];

/** Lookup by the stable key. */
export const findExportTable = (key?: string | null): ExportTable | undefined =>
    EXPORT_TABLES.find((table) => table.key === key);

/**
 * The columns a table exports when nobody has configured it.
 *
 * <p>Used as the starting point in the editor and as the answer when the server has no row for this
 * table — see the note on absence versus emptiness in `ExportColumnConfigService`.
 */
export const defaultColumnKeys = (table: ExportTable): string[] =>
    table.columns.filter((column) => column.defaultOn !== false).map((column) => column.key);

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IMovement } from '../interface';
import { movementTypeLabel, statusLabel, categoryLabels, receiptStatusLabels } from '../constants';
import { exportListPdf, ListPdfColumn, ListPdfMeta } from '../../../utils/pdf/listPdf';
import { exportListExcel, exportListCsv } from '../../../utils/exports/listSheet';
import {
    applyExportColumns,
    loadExportColumnConfig,
    readViewerChoice,
    resolveExportColumns,
} from '../../../utils/exports/exportColumns';

/**
 * The movements register, as a document.
 *
 * <h2>Why this file is now thin</h2>
 * It used to build its own jsPDF document: a solid teal header strip, no logo, no filter strip, no
 * page numbers, and its own CSV escaper and sheet naming beside it. That is the fourth bespoke
 * exporter this codebase has had, and the reason {@code utils/pdf.js} was deleted — a register
 * printed from this page and the same data printed from Reports came out as visibly different
 * documents, so which screen you exported from changed what the file looked like.
 *
 * <p>The list pages reach {@code exportListPdf} through {@code TableUtills}. This page renders its
 * own {@code MovementTable} rather than {@code TableComponent}, so it never passed through there and
 * quietly kept its own. It now calls the same exporters directly.
 *
 * <p>What is left here is the only genuinely movement-specific thing: which columns a movement has
 * and how each reads. Defining them once means a column added for the PDF cannot be missing from the
 * spreadsheet.
 */

const DOCUMENT_TITLE = 'Movements';

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const destLabel = (m: IMovement) =>
    m.destStore?.name ?? (m.recipientUser ? `${m.recipientUser.firstName} ${m.recipientUser.lastName}` : '');

/** The register's columns, in the order they are read. */
const COLUMNS: ListPdfColumn[] = [
    { title: 'Ref', dataKey: 'ref' },
    { title: 'Type', dataKey: 'type' },
    { title: 'Category', dataKey: 'category' },
    { title: 'Source', dataKey: 'source' },
    { title: 'Destination', dataKey: 'destination' },
    { title: 'Items', dataKey: 'items' },
    { title: 'Status', dataKey: 'status' },
    { title: 'Courier', dataKey: 'courier' },
    { title: 'Plate No', dataKey: 'plateNumber' },
    { title: 'Tracking No', dataKey: 'trackingNumber' },
    { title: 'Dispatch Date', dataKey: 'dispatchDate' },
    { title: 'Expected Delivery', dataKey: 'expectedDelivery' },
    { title: 'Receipt Status', dataKey: 'receiptStatus' },
    { title: 'Initiated By', dataKey: 'initiatedBy' },
    { title: 'Created', dataKey: 'created' },
];

/** One flat, display-ready row per movement — shared by all three formats. */
const buildRows = (movements: IMovement[]): Array<Record<string, any>> => movements.map((m) => ({
    ref: `#${m.id ?? ''}`,
    type: movementTypeLabel(m.movementType),
    category: m.movementCategory ? categoryLabels[m.movementCategory] : '',
    source: m.sourceStore?.name ?? '',
    destination: destLabel(m),
    items: m.items?.length ?? 0,
    status: statusLabel(m.status),
    courier: m.courier?.name ?? m.courierService ?? '',
    plateNumber: m.plateNumber ?? '',
    trackingNumber: m.trackingNumber ?? '',
    dispatchDate: fmtDate(m.dispatchDate),
    expectedDelivery: fmtDate(m.expectedDeliveryDate),
    receiptStatus: m.receiptStatus ? receiptStatusLabels[m.receiptStatus] : '',
    initiatedBy: m.initiator ? `${m.initiator.firstName} ${m.initiator.lastName}` : '',
    created: fmtDate(m.createDate),
}));


/**
 * The columns this register should print, narrowed by the configuration and the viewer's choice.
 *
 * <p>This page builds its own file rather than going through `TableComponent`, so it does its own
 * narrowing — but through the same resolver, against the same stored configuration. Two register
 * pages deciding their columns differently is exactly how the bespoke exporters drifted apart
 * before they were unified.
 */
const narrowed = async () => {
    const config = await loadExportColumnConfig();
    return applyExportColumns(
        COLUMNS,
        resolveExportColumns('movements', config, readViewerChoice('movements')),
    );
};

export const exportMovementsPdf = async (movements: IMovement[], meta?: ListPdfMeta) =>
    exportListPdf(await narrowed(), buildRows(movements), DOCUMENT_TITLE, meta);

export const exportMovementsExcel = async (movements: IMovement[]) =>
    exportListExcel(await narrowed(), buildRows(movements), DOCUMENT_TITLE);

export const exportMovementsCsv = async (movements: IMovement[]) =>
    exportListCsv(await narrowed(), buildRows(movements), DOCUMENT_TITLE);

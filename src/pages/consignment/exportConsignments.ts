/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IConsignment, consignmentStatusLabels } from './interface';
import { exportListPdf, ListPdfColumn, ListPdfMeta } from '../../utils/pdf/listPdf';
import { exportListExcel, exportListCsv } from '../../utils/exports/listSheet';
import {
    applyExportColumns,
    loadExportColumnConfig,
    readViewerChoice,
    resolveExportColumns,
} from '../../utils/exports/exportColumns';

/**
 * The consignments register, as a document.
 *
 * <h2>Why this file is now thin</h2>
 * It built its own jsPDF document — a solid header strip, no logo, no filter strip, no page numbers —
 * with its own CSV escaper and sheet naming beside it. That made it the fifth bespoke exporter in
 * this codebase, and the reason {@code utils/pdf.js} was deleted: the same data printed from here and
 * from Reports came out as visibly different documents, so which screen you exported from changed
 * what the file looked like.
 *
 * <p>List pages reach {@code exportListPdf} through {@code TableUtills}. This page renders its own
 * {@code ConsignmentTable}, so it never passed through there and kept its own — exactly as the
 * movements register had.
 *
 * <p>What remains is the only genuinely consignment-specific thing: which columns a journey has.
 * Defining them once means a column added for the PDF cannot go missing from the spreadsheet.
 */

const DOCUMENT_TITLE = 'Consignments';

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

/** The register's columns, in the order they are read. */
const COLUMNS: ListPdfColumn[] = [
    { title: 'Reference', dataKey: 'reference' },
    { title: 'Status', dataKey: 'status' },
    { title: 'Source', dataKey: 'source' },
    { title: 'Destination', dataKey: 'destination' },
    { title: 'Landing Store', dataKey: 'landingStore' },
    { title: 'Movements', dataKey: 'movements' },
    { title: 'Courier', dataKey: 'courier' },
    { title: 'Plate No', dataKey: 'plateNumber' },
    { title: 'Tracking No', dataKey: 'trackingNumber' },
    { title: 'Dispatched', dataKey: 'dispatched' },
    { title: 'Expected Delivery', dataKey: 'expectedDelivery' },
    { title: 'Arrived', dataKey: 'arrived' },
    { title: 'Opened By', dataKey: 'openedBy' },
    { title: 'Received By', dataKey: 'receivedBy' },
    { title: 'Opened', dataKey: 'opened' },
    { title: 'Remarks', dataKey: 'remarks' },
];

/** One flat, display-ready row per journey — shared by all three formats. */
const buildRows = (consignments: IConsignment[]): Array<Record<string, any>> =>
    consignments.map((c) => ({
        reference: c.reference ?? `CNS-${c.id}`,
        status: consignmentStatusLabels[c.status],
        source: c.sourceLocation?.name ?? '',
        destination: c.destLocation?.name ?? '',
        landingStore: c.landingStore?.name ?? '',
        movements: c.movementCount,
        // Free-text service before the courier record, matching the page's own label — a mismatch
        // would print one name and filter on another.
        courier: c.courierService ?? c.courier?.name ?? '',
        plateNumber: c.plateNumber ?? '',
        trackingNumber: c.trackingNumber ?? '',
        dispatched: fmtDate(c.dispatchDate),
        expectedDelivery: fmtDate(c.expectedDeliveryDate),
        arrived: fmtDate(c.arrivalDate),
        openedBy: c.initiator?.name ?? '',
        receivedBy: c.receivingOfficer?.name ?? '',
        opened: fmtDate(c.createDate),
        remarks: c.remarks ?? '',
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
        resolveExportColumns('consignments', config, readViewerChoice('consignments')),
    );
};

export const exportConsignmentsPdf = async (consignments: IConsignment[], meta?: ListPdfMeta) =>
    exportListPdf(await narrowed(), buildRows(consignments), DOCUMENT_TITLE, meta);

export const exportConsignmentsExcel = async (consignments: IConsignment[]) =>
    exportListExcel(await narrowed(), buildRows(consignments), DOCUMENT_TITLE);

export const exportConsignmentsCsv = async (consignments: IConsignment[]) =>
    exportListCsv(await narrowed(), buildRows(consignments), DOCUMENT_TITLE);

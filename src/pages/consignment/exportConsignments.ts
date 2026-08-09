/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { IConsignment, consignmentStatusLabels } from './interface';

const PRIMARY = '#08796C';

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

/** One flat, human-readable row per consignment — shared by all three export formats. */
const buildRows = (consignments: IConsignment[]) => consignments.map((c) => ({
    'Reference': c.reference ?? `CNS-${c.id}`,
    'Status': consignmentStatusLabels[c.status],
    'Source': c.sourceLocation?.name ?? '',
    'Destination': c.destLocation?.name ?? '',
    'Landing Store': c.landingStore?.name ?? '',
    'Movements': c.movementCount,
    'Courier': c.courierService ?? c.courier?.name ?? '',
    'Plate No': c.plateNumber ?? '',
    'Tracking No': c.trackingNumber ?? '',
    'Dispatched': fmtDate(c.dispatchDate),
    'Expected Delivery': fmtDate(c.expectedDeliveryDate),
    'Arrived': fmtDate(c.arrivalDate),
    'Opened By': c.initiator?.name ?? '',
    'Received By': c.receivingOfficer?.name ?? '',
    'Opened': fmtDate(c.createDate),
    'Remarks': c.remarks ?? '',
}));

const stamp = () => new Date().toISOString().slice(0, 10);

const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportConsignmentsCsv = (consignments: IConsignment[]) => {
    const rows = buildRows(consignments);
    const headers = Object.keys(rows[0] ?? { Reference: '' });
    const escape = (v: unknown) => {
        const s = String(v ?? '');
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
        headers.join(','),
        ...rows.map((r) => headers.map((h) => escape((r as Record<string, unknown>)[h])).join(',')),
    ].join('\n');
    // Leading BOM so Excel opens the UTF-8 CSV with correct characters.
    downloadBlob(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }), `consignments-${stamp()}.csv`);
};

export const exportConsignmentsExcel = (consignments: IConsignment[]) => {
    const rows = buildRows(consignments);
    const sheet = XLSX.utils.json_to_sheet(rows);
    sheet['!cols'] = Object.keys(rows[0] ?? {}).map((h) => ({ wch: Math.max(h.length + 2, 14) }));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Consignments');
    XLSX.writeFile(book, `consignments-${stamp()}.xlsx`);
};

export const exportConsignmentsPdf = (consignments: IConsignment[]) => {
    const rows = buildRows(consignments);
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;

    // Brand header strip — same treatment as the movements report.
    doc.setFillColor(PRIMARY);
    doc.rect(0, 0, pageWidth, 60, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Pride Bank Limited', margin, 28);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Consignments Report', margin, 46);

    const generatedLabel = new Date().toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    doc.setFontSize(9);
    doc.text(`Generated: ${generatedLabel}  ·  ${rows.length} consignment(s)`, pageWidth - margin, 46, { align: 'right' });

    const headers = Object.keys(rows[0] ?? { Reference: '' });
    autoTable(doc, {
        startY: 80,
        head: [headers],
        body: rows.length > 0
            ? rows.map((r) => headers.map((h) => String((r as Record<string, unknown>)[h] ?? '')))
            : [['—', 'No consignments matched the current filters', ...headers.slice(2).map(() => '')]],
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 4, lineColor: '#D1D5DB', textColor: '#1E293B', overflow: 'linebreak' },
        headStyles: { fillColor: PRIMARY, textColor: '#FFFFFF', fontStyle: 'bold', halign: 'left', fontSize: 7 },
        margin: { left: margin, right: margin },
    });

    doc.save(`consignments-${stamp()}.pdf`);
};

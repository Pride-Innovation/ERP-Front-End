/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { IMovement } from '../interface';
import { movementTypeLabel, statusLabel, categoryLabels, receiptStatusLabels } from '../constants';

const PRIMARY = '#08796C';

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const destLabel = (m: IMovement) =>
    m.destStore?.name ?? (m.recipientUser ? `${m.recipientUser.firstName} ${m.recipientUser.lastName}` : '');

/** One flat, human-readable row per movement — shared by all three export formats. */
const buildRows = (movements: IMovement[]) => movements.map((m) => ({
    'Ref': `#${m.id ?? ''}`,
    'Type': movementTypeLabel(m.movementType),
    'Category': m.movementCategory ? categoryLabels[m.movementCategory] : '',
    'Source': m.sourceStore?.name ?? '',
    'Destination': destLabel(m),
    'Items': m.items?.length ?? 0,
    'Status': statusLabel(m.status),
    'Courier': m.courier?.name ?? m.courierService ?? '',
    'Plate No': m.plateNumber ?? '',
    'Tracking No': m.trackingNumber ?? '',
    'Dispatch Date': fmtDate(m.dispatchDate),
    'Expected Delivery': fmtDate(m.expectedDeliveryDate),
    'Receipt Status': m.receiptStatus ? receiptStatusLabels[m.receiptStatus] : '',
    'Initiated By': m.initiator ? `${m.initiator.firstName} ${m.initiator.lastName}` : '',
    'Created': fmtDate(m.createDate),
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

export const exportMovementsCsv = (movements: IMovement[]) => {
    const rows = buildRows(movements);
    const headers = Object.keys(rows[0] ?? { Ref: '' });
    const escape = (v: unknown) => {
        const s = String(v ?? '');
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
        headers.join(','),
        ...rows.map((r) => headers.map((h) => escape((r as Record<string, unknown>)[h])).join(',')),
    ].join('\n');
    // Leading BOM so Excel opens the UTF-8 CSV with correct characters.
    downloadBlob(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }), `movements-${stamp()}.csv`);
};

export const exportMovementsExcel = (movements: IMovement[]) => {
    const rows = buildRows(movements);
    const sheet = XLSX.utils.json_to_sheet(rows);
    // Reasonable column widths so the sheet opens readable without manual resizing.
    sheet['!cols'] = Object.keys(rows[0] ?? {}).map((h) => ({ wch: Math.max(h.length + 2, 14) }));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Movements');
    XLSX.writeFile(book, `movements-${stamp()}.xlsx`);
};

export const exportMovementsPdf = (movements: IMovement[]) => {
    const rows = buildRows(movements);
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;

    // Brand header strip — same treatment as the release note PDF.
    doc.setFillColor(PRIMARY);
    doc.rect(0, 0, pageWidth, 60, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Pride Bank Limited', margin, 28);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Movements Report', margin, 46);

    const generatedLabel = new Date().toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    doc.setFontSize(9);
    doc.text(`Generated: ${generatedLabel}  ·  ${rows.length} movement(s)`, pageWidth - margin, 46, { align: 'right' });

    const headers = Object.keys(rows[0] ?? { Ref: '' });
    autoTable(doc, {
        startY: 80,
        head: [headers],
        body: rows.length > 0
            ? rows.map((r) => headers.map((h) => String((r as Record<string, unknown>)[h] ?? '')))
            : [['—', 'No movements matched the current filters', ...headers.slice(2).map(() => '')]],
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 4, lineColor: '#D1D5DB', textColor: '#1E293B', overflow: 'linebreak' },
        headStyles: { fillColor: PRIMARY, textColor: '#FFFFFF', fontStyle: 'bold', halign: 'left', fontSize: 7 },
        margin: { left: margin, right: margin },
    });

    doc.save(`movements-${stamp()}.pdf`);
};

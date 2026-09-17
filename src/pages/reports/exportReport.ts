/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import LogoSrc from '../../statics/images/pride_logo_horizontal.png';
import {
    BORDER, MUTED, WASH, listTableStyles, listTableHeadStyles,
    drawDocHeader, drawFooter, loadImage, rightAlignHeaders,
} from '../../utils/pdf/docKit';
import { ReportColumn } from './ReportDataTable';
import { ReportShellFilters } from './ReportShell';

/**
 * One exporter for every report.
 *
 * <p>The three export buttons used to call `alert('PDF export triggered')`. Rather than write three
 * of these per panel, the shell hands over the columns and the rows it is already displaying — so an
 * export always matches what is on screen, filters included, and every report gets the same branded
 * PDF header the GRN and dispatch notes use.
 */

/** Cell text for export: the raw value, since `format` returns React nodes a file cannot hold. */
const cellText = (row: any, col: ReportColumn<any>): string => {
    const v = row?.[col.id as string];
    if (v === null || v === undefined) return '';
    return String(v);
};

const filename = (title: string, ext: string) =>
    `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${new Date().toISOString().slice(0, 10)}.${ext}`;

/** A one-line description of the filters, so a printed report says what it is a report *of*. */
const describeFilters = (f?: ReportShellFilters): string => {
    if (!f) return 'All records';
    const parts: string[] = [];
    if (f.dateFrom && f.dateTo) {
        const d = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        parts.push(`${d(f.dateFrom)} – ${d(f.dateTo)}`);
    }
    if (f.branch) parts.push(f.branch);
    if (f.department) parts.push(f.department);
    if (f.category) parts.push(f.category);
    if (f.status) parts.push(f.status);
    return parts.length ? parts.join('  ·  ') : 'All records';
};

export interface ReportExportInput<T> {
    title: string;
    columns: ReportColumn<T>[];
    rows: T[];
    filters?: ReportShellFilters;
}

export const exportReportPdf = async <T,>({ title, columns, rows, filters }: ReportExportInput<T>) => {
    const logo = await loadImage(LogoSrc);
    // Landscape: a register runs to thirteen columns and portrait squeezes them past legibility.
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 32;
    const refNo = new Date().toLocaleDateString('en-GB');

    const drawHeader = () => drawDocHeader(doc, { logo, title: title.toUpperCase(), refNo, pageW, margin });
    let y = drawHeader() + 22;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(MUTED);
    doc.text(describeFilters(filters), margin, y);
    doc.text(`${rows.length} record(s)`, pageW - margin, y, { align: 'right' });
    y += 14;

    const numeric = columns
        .map((c, i) => (c.align === 'right' ? i : -1))
        .filter((i) => i >= 0);

    const firstPage = doc.getNumberOfPages();

    autoTable(doc, {
        startY: y,
        head: [columns.map((c) => c.label)],
        body: rows.map((r) => columns.map((c) => cellText(r, c))),
        theme: 'plain',
        showHead: 'everyPage',
        styles: listTableStyles,
        headStyles: listTableHeadStyles,
        alternateRowStyles: { fillColor: WASH },
        // Headings of right-aligned columns must follow their figures; autoTable applies
        // columnStyles to the body only, so alignment is set per cell instead.
        didParseCell: rightAlignHeaders(numeric),
        margin: { top: 96, left: margin, right: margin, bottom: 40 },
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 0) {
                doc.setDrawColor(BORDER);
                doc.setLineWidth(0.4);
                doc.line(margin, data.cell.y + data.row.height, pageW - margin, data.cell.y + data.row.height);
            }
        },
        didDrawPage: () => { if (doc.getNumberOfPages() > firstPage) drawHeader(); },
    });

    drawFooter(doc, { pageW, pageH, margin, refNo, note: 'Confidential — internal reporting' });
    doc.save(filename(title, 'pdf'));
};

/** Shared by the Excel and CSV writers — the same grid, written by two different encoders. */
const toSheet = <T,>(columns: ReportColumn<T>[], rows: T[]) => {
    const grid = [
        columns.map((c) => c.label),
        ...rows.map((r) => columns.map((c) => cellText(r, c))),
    ];
    return XLSX.utils.aoa_to_sheet(grid);
};

export const exportReportExcel = <T,>({ title, columns, rows }: ReportExportInput<T>) => {
    const book = XLSX.utils.book_new();
    // 31 characters is Excel's hard limit for a sheet name; a longer one makes the file unopenable.
    XLSX.utils.book_append_sheet(book, toSheet(columns, rows), title.slice(0, 31));
    XLSX.writeFile(book, filename(title, 'xlsx'));
};

export const exportReportCsv = <T,>({ title, columns, rows }: ReportExportInput<T>) => {
    const csv = XLSX.utils.sheet_to_csv(toSheet(columns, rows));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename(title, 'csv');
    a.click();
    URL.revokeObjectURL(url);
};

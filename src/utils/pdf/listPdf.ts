/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import LogoSrc from '../../statics/images/pride_logo_horizontal.png';
import {
    BORDER, MUTED, WASH, listTableStyles, listTableHeadStyles,
    drawDocHeader, drawFooter, loadImage,
} from './docKit';

/**
 * The reports-quality PDF, for the list pages.
 *
 * <p>The list pages had their own exporter ({@code utils/pdf.js}) which painted a hundred-point
 * solid header block on every page and gave the table no repeated headings, no filter strip and no
 * page numbering. The reports pages meanwhile share the GRN and dispatch-note furniture through
 * {@code docKit}. This is that same treatment, taking the {@code {title, dataKey}} column shape the
 * list pages already produce so it can drop straight into {@code TableUtills}.
 *
 * <p>Deliberately not merged with {@code pages/reports/exportReport.ts}: that one is typed to the
 * reports' {@code ReportColumn} and reads its filter strip off {@code ReportShellFilters}. Sharing
 * the layout rather than the signature keeps both honest about the data they are given.
 */

export interface ListPdfColumn {
    title: string;
    dataKey: string;
}

export interface ListPdfMeta {
    /** Rendered under the header, so a printed sheet says which slice of the data it is. */
    filters?: Array<{ label: string; value: string }>;
}

const filename = (title: string) =>
    `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
    + `-${new Date().toISOString().slice(0, 10)}.pdf`;

/** Cell text. Values are already display-formatted by the page's table mapper. */
const cellText = (row: any, col: ListPdfColumn): string => {
    const v = row?.[col.dataKey];
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return '';
    return String(v);
};

const describeFilters = (meta?: ListPdfMeta): string => {
    const parts = (meta?.filters ?? [])
        .filter((f) => f && f.value)
        .map((f) => `${f.label}: ${f.value}`);
    return parts.length ? parts.join('   ·   ') : 'All records';
};

export const exportListPdf = async (
    columns: ListPdfColumn[],
    rows: Array<Record<string, any>>,
    title: string,
    meta?: ListPdfMeta,
): Promise<void> => {
    const logo = await loadImage(LogoSrc);
    // Landscape: a register runs to a dozen columns and portrait squeezes them past legibility.
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 32;
    const refNo = new Date().toLocaleDateString('en-GB');
    const heading = title.toUpperCase();

    const drawHeader = () => drawDocHeader(doc, { logo, title: heading, refNo, pageW, margin });
    let y = drawHeader() + 22;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(MUTED);

    // Wrapped, because a filter summary naming four values overruns the page width and jsPDF would
    // otherwise print it straight off the edge.
    const summary = doc.splitTextToSize(describeFilters(meta), pageW - margin * 2 - 90) as string[];
    summary.forEach((line, i) => doc.text(line, margin, y + i * 11));
    doc.text(`${rows.length} record(s)`, pageW - margin, y, { align: 'right' });
    y += summary.length * 11 + 6;

    const firstPage = doc.getNumberOfPages();

    autoTable(doc, {
        startY: y,
        head: [columns.map((c) => c.title)],
        body: rows.map((r) => columns.map((c) => cellText(r, c))),
        theme: 'plain',
        // Repeated on every page: a register runs to many pages and a table whose headings appear
        // only once is unreadable from page two onwards.
        showHead: 'everyPage',
        styles: listTableStyles,
        headStyles: listTableHeadStyles,
        alternateRowStyles: { fillColor: WASH },
        margin: { top: 96, left: margin, right: margin, bottom: 40 },
        didDrawCell: (data) => {
            // A hairline under each row instead of a full grid — the same restraint the reports and
            // the dispatch notes use.
            if (data.section === 'body' && data.column.index === 0) {
                doc.setDrawColor(BORDER);
                doc.setLineWidth(0.4);
                doc.line(margin, data.cell.y + data.row.height, pageW - margin, data.cell.y + data.row.height);
            }
        },
        didDrawPage: () => { if (doc.getNumberOfPages() > firstPage) drawHeader(); },
    });

    drawFooter(doc, { pageW, pageH, margin, refNo, note: 'Confidential — internal reporting' });
    doc.save(filename(title));
};

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as XLSX from 'xlsx';
import { ListPdfColumn } from '../pdf/listPdf';

/**
 * Excel and CSV for the list pages, on the same terms as {@link exportListPdf}.
 *
 * <h2>Why this exists</h2>
 * The reports pages already share one grid between their two spreadsheet writers, so an export of
 * the same data is the same file whichever button produced it. The list pages had no such thing, and
 * a page needing a spreadsheet wrote its own — which is how the movements register ended up with a
 * hand-rolled CSV escaper and its own sheet-naming, neither of which matched the reports.
 *
 * <p>Taking {@link ListPdfColumn} means a page defines its columns <b>once</b> and gets all three
 * formats from them. A column added for the PDF cannot then be missing from the spreadsheet, which
 * is the divergence worth designing out — a partial export is worse than a missing one, because the
 * file looks complete.
 *
 * <p>Deliberately not merged with {@code pages/reports/exportReport.ts}: that one is typed to the
 * reports' own {@code ReportColumn} and reads its filter strip off {@code ReportShellFilters}.
 * Sharing the conventions rather than the signature keeps both honest about the data they are given.
 */

/** Same shape the reports use, so a movements export and a report export sit together in a folder. */
export const exportFilename = (title: string, extension: string): string =>
    `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
    + `-${new Date().toISOString().slice(0, 10)}.${extension}`;

/** Cell text. Values are already display-formatted by the page's row mapper. */
const cellText = (row: Record<string, any>, column: ListPdfColumn): string => {
    const value = row?.[column.dataKey];
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return '';
    return String(value);
};

/** The grid both writers encode — one definition, so the two formats cannot drift apart. */
const toSheet = (columns: ListPdfColumn[], rows: Array<Record<string, any>>) => {
    const grid = [
        columns.map((c) => c.title),
        ...rows.map((row) => columns.map((c) => cellText(row, c))),
    ];
    return XLSX.utils.aoa_to_sheet(grid);
};

export const exportListExcel = (
    columns: ListPdfColumn[],
    rows: Array<Record<string, any>>,
    title: string,
): void => {
    const sheet = toSheet(columns, rows);
    // Wide enough to open readable without manual resizing; the header is the usual longest cell.
    sheet['!cols'] = columns.map((c) => ({ wch: Math.max(c.title.length + 2, 14) }));

    const book = XLSX.utils.book_new();
    // 31 characters is Excel's hard limit for a sheet name; a longer one makes the file unopenable.
    XLSX.utils.book_append_sheet(book, sheet, title.slice(0, 31));
    XLSX.writeFile(book, exportFilename(title, 'xlsx'));
};

export const exportListCsv = (
    columns: ListPdfColumn[],
    rows: Array<Record<string, any>>,
    title: string,
): void => {
    // Encoded by the same library that writes the workbook rather than by a hand-rolled escaper —
    // quoting, embedded newlines and commas are exactly the cases a bespoke one gets wrong.
    const csv = XLSX.utils.sheet_to_csv(toSheet(columns, rows));

    // Leading BOM so Excel opens the UTF-8 file with the right characters.
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFilename(title, 'csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

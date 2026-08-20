/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import ExcelJS from 'exceljs';
import { fetchAssetImportTemplateService } from './service/importService';
import { IAssetImportTemplate } from './interface';
import { ColumnSpec, stateOf, visibleAssetImportColumns } from './assetImportColumns';

// Re-exported so callers that only need the header list don't pull ExcelJS in with it.
export { assetImportHeaders } from './assetImportColumns';

/**
 * Builds the asset import spreadsheet for one category.
 *
 * <p>Columns, and which of them are required, come from the category's own `fieldConfig` — the same
 * map that drives the create form. So Fleet gets no RAM column, IT Equipment does, and a field
 * someone marks required in settings gains its asterisk here without anyone editing this file. The
 * alternative, a hard-coded header list, is a second definition of the same thing and would fall out
 * of step the first time a category changed.
 *
 * <p>Dropdowns are backed by workbook-level *defined names* pointing at a `veryHidden` sheet, the
 * same technique the user template uses: defined names are the only cross-sheet reference Excel
 * honours reliably, and `veryHidden` keeps the master data out of reach of the worksheet tabs.
 */

/** Brand teal, as Excel's ARGB. */
const HEADER_FILL = 'FF087970';
const REQUIRED_FILL = 'FF0A6B5D';

/** Excel column letter for a 1-based index: 1 → A, 27 → AA. */
const columnLetter = (index: number): string => {
    let n = index;
    let letters = '';
    while (n > 0) {
        const rem = (n - 1) % 26;
        letters = String.fromCharCode(65 + rem) + letters;
        n = Math.floor((n - 1) / 26);
    }
    return letters;
};

export const downloadAssetImportTemplate = async (assetTypeId: number): Promise<void> => {
    const meta: IAssetImportTemplate = await fetchAssetImportTemplateService(assetTypeId);

    const columns = visibleAssetImportColumns(meta.fieldConfig);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Pride Bank ERP';
    wb.created = new Date();

    // ── Hidden lookup sheet, one column per dropdown ─────────────────────────
    const lists = wb.addWorksheet('_Lists', { state: 'veryHidden' });

    const sources: Array<{ name: ColumnSpec['list']; values: string[] }> = [
        { name: 'BranchList', values: meta.branches ?? [] },
        { name: 'SupplierList', values: meta.suppliers ?? [] },
        { name: 'CommodityList', values: meta.commodities ?? [] },
        { name: 'StatusList', values: meta.statuses ?? [] },
        { name: 'StaffList', values: meta.staff ?? [] },
    ];

    sources.forEach((source, i) => {
        const col = columnLetter(i + 1);
        lists.getCell(`${col}1`).value = source.name as string;
        source.values.forEach((v, r) => { lists.getCell(`${col}${r + 2}`).value = v; });
        // An empty list would produce the range A2:A1, which Excel rejects outright and which would
        // make the whole workbook unopenable — collapse it to a single cell instead.
        const lastRow = source.values.length > 0 ? source.values.length + 1 : 2;
        wb.definedNames.add(`_Lists!$${col}$2:$${col}$${lastRow}`, source.name as string);
    });

    // ── The data sheet ───────────────────────────────────────────────────────
    const sheet = wb.addWorksheet('Assets', { views: [{ state: 'frozen', ySplit: 1 }] });

    sheet.columns = columns.map((c) => {
        const required = stateOf(c, meta.fieldConfig) === 'required';
        return { header: required ? `${c.header} *` : c.header, key: c.header, width: c.width };
    });

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow.height = 28;
    headerRow.eachCell((cell, colNumber) => {
        const required = stateOf(columns[colNumber - 1], meta.fieldConfig) === 'required';
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: required ? REQUIRED_FILL : HEADER_FILL } };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        };
    });

    // A worked row, greyed and italic so it reads as an example rather than data. Deleting it is
    // harmless: a row with no Asset Name and no Engraved Number simply fails validation and is
    // reported, and the Notes sheet says to overwrite it.
    sheet.addRow(columns.map((c) => c.sample ?? ''));
    sheet.getRow(2).font = { italic: true, color: { argb: 'FF94A3B8' } };

    // ── Per-column formatting, validation and prompts ────────────────────────
    const lastRow = meta.maxRows + 1; // header occupies row 1

    columns.forEach((spec, i) => {
        const letter = columnLetter(i + 1);
        const range = `${letter}2:${letter}${lastRow}`;
        const dv = (sheet as any).dataValidations;

        if (spec.numFmt) {
            sheet.getColumn(i + 1).numFmt = spec.numFmt;
        }

        if (spec.list) {
            dv.add(range, {
                type: 'list',
                allowBlank: true,
                formulae: [`=${spec.list}`],
                showErrorMessage: true,
                errorTitle: `Invalid ${spec.header}`,
                error: 'Pick a value from the dropdown.',
                showInputMessage: Boolean(spec.hint),
                promptTitle: spec.header,
                prompt: spec.hint,
            });
        } else if (spec.hint) {
            // No list to constrain against, but the prompt is still worth showing — so a permissive
            // validation carries it. `custom` with TRUE never rejects anything.
            dv.add(range, {
                type: 'custom',
                allowBlank: true,
                formulae: ['TRUE'],
                showErrorMessage: false,
                showInputMessage: true,
                promptTitle: spec.header,
                prompt: spec.hint,
            });
        }
    });

    // ── Notes sheet: the rules, in plain English ─────────────────────────────
    const notes = wb.addWorksheet('Notes');
    notes.columns = [{ width: 22 }, { width: 96 }];

    const writeHeading = (text: string) => {
        const row = notes.addRow([text, '']);
        row.font = { bold: true, size: 12, color: { argb: 'FF0F172A' } };
        row.height = 22;
    };
    const writeNote = (label: string, text: string) => {
        const row = notes.addRow([label, text]);
        row.getCell(1).font = { bold: true, color: { argb: 'FF475569' } };
        row.getCell(1).alignment = { vertical: 'top' };
        row.getCell(2).alignment = { vertical: 'top', wrapText: true };
    };

    writeHeading(`${meta.assetTypeName} — import notes`);
    notes.addRow([]);
    writeNote('How many rows', `Up to ${meta.maxRows.toLocaleString()} rows per file. `
        + `Larger files must be split. They are uploaded in batches of ${meta.batchSize}, `
        + 'so progress is shown as it goes and a problem late in the file does not undo the rows before it.');
    writeNote('Required columns', 'Marked with * in the header. A row missing one is reported and skipped; '
        + 'every other row still imports.');
    writeNote('The sample row', 'Row 2 is an example. Overwrite it or delete it before uploading.');
    writeNote('Dropdowns', 'Columns with a dropdown only accept values from it. If something you need is '
        + 'missing, add it under Settings first, then download the template again.');
    writeNote('Engraved Number', 'Must be unique across the whole register, and must not repeat within this file. '
        + 'A duplicate is reported and skipped — so a corrected file can safely be uploaded again.');
    writeNote('Serial Number', 'Same rule as Engraved Number, where one is given.');
    writeNote('Dates', 'dd/mm/yyyy, or format the cell as a date. Both are read correctly.');
    writeNote('Money', 'Plain numbers. Currency prefixes, commas and spaces are ignored, so "UGX 1,200,000" works, '
        + 'but a blank cell means "not known" rather than zero.');
    writeNote('Assigned To', 'Staff number or email address. Naming a holder also writes the assignment history, '
        + 'so the asset\'s trail is correct from the start. No email is sent — an import would otherwise '
        + 'notify every member of staff about assets they already hold.');
    writeNote('Status', 'Leave blank and the asset is imported as "Require Update", which flags it as needing '
        + 'its details completed. Name a status and it is honoured.');
    writeNote('Category', `Every row in this file is imported as ${meta.assetTypeName}. `
        + 'To import another category, download that category\'s own template.');
    notes.addRow([]);
    writeNote('If a row fails', 'The summary lists every failure with its row number and the reason. '
        + 'You can download just the failed rows, fix them, and upload that file on its own.');

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meta.assetTypeName.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}_import_template.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

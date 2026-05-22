/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import ExcelJS from 'exceljs';
import {
    fetchAllBranches,
    fetchAllDepartments,
    fetchAllRoles,
    fetchAllTitles,
    ReferenceOption,
} from './service/referenceData';

/**
 * Generates a real .xlsx user import template with data-validation dropdowns
 * for Title / Role / Duty Station / Department / Gender. The lookup values are
 * pulled live from the backend so the template always reflects the current
 * configuration.
 *
 * Layout:
 *   Sheet "Users" — header row, sample row, 200 empty validated rows.
 *   Sheet "Lists" (hidden) — one column per validated field; the Users sheet
 *   references these via `=Lists!$<col>$2:$<col>$<lastRow>` named ranges.
 */
export const downloadUserImportTemplate = async (): Promise<void> => {
    const [titles, roles, branches, departments] = await Promise.all([
        fetchAllTitles(),
        fetchAllRoles(),
        fetchAllBranches(),
        fetchAllDepartments(),
    ]);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Pride Bank ERP';
    wb.created = new Date();

    // ── Hidden "Lists" sheet — one column per validated field ─────────────
    const lists = wb.addWorksheet('Lists', { state: 'hidden' });
    lists.getCell('A1').value = 'Titles';
    lists.getCell('B1').value = 'Roles';
    lists.getCell('C1').value = 'Branches';
    lists.getCell('D1').value = 'Departments';
    lists.getCell('E1').value = 'Genders';

    const writeColumn = (col: string, values: string[]) => {
        values.forEach((v, i) => {
            lists.getCell(`${col}${i + 2}`).value = v;
        });
    };
    const titleNames = titles.map((o: ReferenceOption) => o.label);
    const roleNames = roles.map((o: ReferenceOption) => o.label);
    const branchNames = branches.map((o: ReferenceOption) => o.label);
    const deptNames = departments.map((o: ReferenceOption) => o.label);
    const genderValues = ['Male', 'Female'];

    writeColumn('A', titleNames);
    writeColumn('B', roleNames);
    writeColumn('C', branchNames);
    writeColumn('D', deptNames);
    writeColumn('E', genderValues);

    // ── Main "Users" sheet ────────────────────────────────────────────────
    const users = wb.addWorksheet('Users', {
        views: [{ state: 'frozen', ySplit: 1 }],
    });

    const headers = ['No.', 'Name', 'Staff Number', 'Email', 'Title', 'Role', 'Duty Station', 'Department', 'Gender'];
    users.columns = headers.map(h => ({ header: h, key: h, width: Math.max(14, h.length + 6) }));

    // Style the header row in brand colour.
    const headerRow = users.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 22;
    headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF087970' } };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        };
    });

    // Sample row so the user sees exactly what's expected.
    const sample = [
        1,
        'Jane Doe',
        'PBL0001',
        'jane.doe@pridebank.co.ug',
        titleNames[0] ?? '',
        roleNames[0] ?? '',
        branchNames[0] ?? '',
        '',
        'Female',
    ];
    users.addRow(sample);
    users.getRow(2).font = { italic: true, color: { argb: 'FF94A3B8' } };

    // ── Data validation across 200 blank rows below the sample ────────────
    const totalRows = 202; // rows 3 .. 202

    /** Build a `Lists!$col$2:$col$N` formula reference. */
    const range = (col: string, count: number) => `=Lists!$${col}$2:$${col}$${count + 1}`;

    // Worksheet-level `dataValidations` exists at runtime but isn't exposed by
    // ExcelJS's public types — cast through `any` to reach it.
    const dv = (users as any).dataValidations;

    dv.add(`E2:E${totalRows}`, {
        type: 'list',
        allowBlank: true,
        formulae: [range('A', titleNames.length)],
        showErrorMessage: true,
        errorTitle: 'Invalid Title',
        error: 'Pick a value from the dropdown.',
    });
    dv.add(`F2:F${totalRows}`, {
        type: 'list',
        allowBlank: true,
        formulae: [range('B', roleNames.length)],
        showErrorMessage: true,
        errorTitle: 'Invalid Role',
        error: 'Pick a value from the dropdown.',
    });
    dv.add(`G2:G${totalRows}`, {
        type: 'list',
        allowBlank: true,
        formulae: [range('C', branchNames.length)],
        showErrorMessage: true,
        errorTitle: 'Invalid Duty Station',
        error: 'Pick a value from the dropdown.',
    });
    dv.add(`H2:H${totalRows}`, {
        type: 'list',
        allowBlank: true,
        formulae: [range('D', deptNames.length)],
        showErrorMessage: true,
        errorTitle: 'Invalid Department',
        error: 'Pick a value from the dropdown. Only applies when Duty Station is Head Office.',
    });
    dv.add(`I2:I${totalRows}`, {
        type: 'list',
        allowBlank: true,
        formulae: ['"Male,Female"'],
        showErrorMessage: true,
        errorTitle: 'Invalid Gender',
        error: 'Pick Male or Female.',
    });
    dv.add(`D2:D${totalRows}`, {
        type: 'custom',
        allowBlank: true,
        formulae: ['=ISNUMBER(SEARCH("@pridebank.co.ug",D2))'],
        showErrorMessage: true,
        errorTitle: 'Invalid Email',
        errorStyle: 'warning',
        error: 'Emails should end with @pridebank.co.ug.',
    });

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_import_template.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

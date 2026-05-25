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
 * Generates a real .xlsx user import template with proper Excel data-validation
 * dropdowns for Gender / Title / Role / Duty Station / Department. Lookup
 * values are pulled live from the backend so the template always reflects the
 * current system configuration.
 *
 * The dropdowns are backed by workbook-level *defined names* (named ranges)
 * rather than direct cross-sheet cell references — defined names are the only
 * pattern Excel honors reliably when the source range lives on a hidden sheet.
 * The source sheet itself is `veryHidden`, so end-users cannot unhide it from
 * the worksheet tabs and accidentally edit the master data.
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

    // ── Hidden source sheet — one column per lookup field ────────────────
    // `veryHidden` prevents users from unhiding via the worksheet-tab context
    // menu (only achievable through the VBA editor).
    const lists = wb.addWorksheet('_Lists', { state: 'veryHidden' });

    const writeColumn = (col: string, header: string, values: string[]) => {
        lists.getCell(`${col}1`).value = header;
        values.forEach((v, i) => {
            lists.getCell(`${col}${i + 2}`).value = v;
        });
    };

    const titleNames = titles.map((o: ReferenceOption) => o.label);
    const roleNames = roles.map((o: ReferenceOption) => o.label);
    const branchNames = branches.map((o: ReferenceOption) => o.label);
    const deptNames = departments.map((o: ReferenceOption) => o.label);
    const genderValues = ['Male', 'Female'];

    writeColumn('A', 'Titles', titleNames);
    writeColumn('B', 'Roles', roleNames);
    writeColumn('C', 'Branches', branchNames);
    writeColumn('D', 'Departments', deptNames);
    writeColumn('E', 'Genders', genderValues);

    // ── Defined names (named ranges) for each dropdown source ────────────
    // Empty lists collapse to a single-cell range to avoid Excel rejecting
    // an invalid `A2:A1` reference; the dropdown will simply be empty.
    const addName = (name: string, col: string, count: number) => {
        const lastRow = count > 0 ? count + 1 : 2;
        wb.definedNames.add(`_Lists!$${col}$2:$${col}$${lastRow}`, name);
    };
    addName('TitleList', 'A', titleNames.length);
    addName('RoleList', 'B', roleNames.length);
    addName('BranchList', 'C', branchNames.length);
    addName('DepartmentList', 'D', deptNames.length);
    addName('GenderList', 'E', genderValues.length);

    // ── Main "Users" sheet ────────────────────────────────────────────────
    const users = wb.addWorksheet('Users', {
        views: [{ state: 'frozen', ySplit: 1 }],
    });

    // Column order mirrors the user-creation form. Required columns are marked
    // with * in the header; the sample row in row 2 shows the expected shape.
    const headers = [
        'No.',
        'First Name *',
        'Last Name *',
        'Other Name',
        'Email *',
        'Staff Number *',
        'Gender *',
        'Title *',
        'Role',
        'Duty Station *',
        'Department',
    ];

    // Per-column widths chosen to keep the header text readable without
    // truncating typical values (emails, branch names).
    const widths = [6, 18, 18, 18, 32, 16, 12, 24, 22, 24, 24];
    users.columns = headers.map((h, i) => ({ header: h, key: h, width: widths[i] }));

    // Style the header row in brand colour.
    const headerRow = users.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 24;
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
        'Jane',
        'Doe',
        '',
        'jane.doe@pridebank.co.ug',
        'PBL0001',
        'Female',
        titleNames[0] ?? '',
        '',
        branchNames[0] ?? '',
        '',
    ];
    users.addRow(sample);
    users.getRow(2).font = { italic: true, color: { argb: 'FF94A3B8' } };

    // ── Data validation across the data rows below the sample ────────────
    const totalRows = 502; // rows 2 .. 502 (sample + 500 empty rows)

    // ExcelJS 4.x: `dataValidations` is a runtime property not exposed by the
    // public types — cast through `any` to reach it.
    const dv = (users as any).dataValidations;

    // Column letters per the header order above:
    // A=No, B=FirstName, C=LastName, D=OtherName, E=Email, F=StaffNumber,
    // G=Gender, H=Title, I=Role, J=DutyStation, K=Department
    dv.add(`G2:G${totalRows}`, {
        type: 'list',
        allowBlank: true,
        formulae: ['=GenderList'],
        showErrorMessage: true,
        errorTitle: 'Invalid Gender',
        error: 'Pick a value from the dropdown (Male or Female).',
    });
    dv.add(`H2:H${totalRows}`, {
        type: 'list',
        allowBlank: true,
        formulae: ['=TitleList'],
        showErrorMessage: true,
        errorTitle: 'Invalid Title',
        error: 'Pick a value from the dropdown.',
    });
    dv.add(`I2:I${totalRows}`, {
        type: 'list',
        allowBlank: true,
        formulae: ['=RoleList'],
        showErrorMessage: true,
        errorTitle: 'Invalid Role',
        error: 'Pick a value from the dropdown.',
    });
    dv.add(`J2:J${totalRows}`, {
        type: 'list',
        allowBlank: true,
        formulae: ['=BranchList'],
        showErrorMessage: true,
        errorTitle: 'Invalid Duty Station',
        error: 'Pick a value from the dropdown.',
    });
    dv.add(`K2:K${totalRows}`, {
        type: 'list',
        allowBlank: true,
        formulae: ['=DepartmentList'],
        showErrorMessage: true,
        errorTitle: 'Invalid Department',
        error: 'Pick a value from the dropdown. Only applies when Duty Station is Head Office.',
    });

    // Soft warning if the email doesn't end with the bank's domain.
    dv.add(`E2:E${totalRows}`, {
        type: 'custom',
        allowBlank: true,
        formulae: ['=ISNUMBER(SEARCH("@pridebank.co.ug",E2))'],
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

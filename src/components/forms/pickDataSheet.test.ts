/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as XLSX from 'xlsx';
import { pickDataSheet } from './pickDataSheet';

/**
 * Every bulk import read the wrong worksheet.
 *
 * `FileUploadButton` took `SheetNames[0]`, and both templates open with a hidden reference sheet -
 * `addWorksheet('_Lists', { state: 'veryHidden' })` - before adding `Users` or `Assets`. So the
 * importer posted the dropdown source lists to the server instead of the rows the user had filled
 * in, for users and assets alike.
 *
 * It hid well because the wrong sheet still parses: it has headers, so the result is well-formed
 * rows that simply describe titles and branches rather than people. The server could only say the
 * columns were unrecognised, and nothing on either side named the sheet.
 */
describe('pickDataSheet', () => {
    const build = (sheets: Array<{ name: string; hidden?: 0 | 1 | 2 }>): XLSX.WorkBook => {
        const workbook = XLSX.utils.book_new();
        sheets.forEach(({ name }) => {
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['Header']]), name);
        });
        workbook.Workbook = { Sheets: sheets.map(({ hidden }) => ({ Hidden: hidden ?? 0 })) };
        return workbook;
    };

    it('skips the veryHidden lists sheet the templates put first', () => {
        // Exactly the shape userImportTemplate and assetImportTemplate produce.
        const workbook = build([
            { name: '_Lists', hidden: 2 },
            { name: 'Users' },
        ]);

        expect(pickDataSheet(workbook)).toBe('Users');
    });

    it('takes the first visible sheet when a template carries several', () => {
        // assetImportTemplate adds a visible Notes sheet after Assets.
        const workbook = build([
            { name: '_Lists', hidden: 2 },
            { name: 'Assets' },
            { name: 'Notes' },
        ]);

        expect(pickDataSheet(workbook)).toBe('Assets');
    });

    it('falls back to the underscore convention when nothing is marked hidden', () => {
        // A template edited and re-saved by a tool that drops visibility flags still parses.
        const workbook = build([
            { name: '_Lists' },
            { name: 'Users' },
        ]);

        expect(pickDataSheet(workbook)).toBe('Users');
    });

    it('accepts an ordinary single-sheet file exported from elsewhere', () => {
        // The common case, and the one the old behaviour got right - it must keep working.
        expect(pickDataSheet(build([{ name: 'Sheet1' }]))).toBe('Sheet1');
    });

    it('returns the first sheet rather than nothing when every sheet looks like scaffolding', () => {
        // Refusing here would reject a file that might still be usable; the parse step reports it.
        expect(pickDataSheet(build([{ name: '_One' }, { name: '_Two' }]))).toBe('_One');
    });

    it('survives a workbook carrying no visibility metadata at all', () => {
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['Header']]), 'Data');
        delete workbook.Workbook;

        expect(pickDataSheet(workbook)).toBe('Data');
    });
});

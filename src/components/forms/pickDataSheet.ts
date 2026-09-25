/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as XLSX from 'xlsx';

/**
 * The sheet the user's data is actually on.
 *
 * <p>This used to be `SheetNames[0]`, and both import templates put a **hidden** sheet first:
 * `userImportTemplate` and `assetImportTemplate` each open with
 * `addWorksheet('_Lists', { state: 'veryHidden' })` - the reference data backing the dropdowns -
 * and only then add `Users` or `Assets`. So every import read the wrong sheet and posted the
 * dropdown source lists to the server.
 *
 * <p>It failed in a way that hid the cause. The lists sheet has real headers, so the parser
 * produced well-formed rows; they simply described titles, roles, branches and departments rather
 * than people. The server answered "Something went wrong" because the field names could not be
 * mapped, and nothing anywhere named the sheet.
 *
 * <p>Two rules, in order. Prefer a **visible** sheet - Excel marks `_Lists` as `veryHidden`
 * (`Hidden: 2`), and no template hides the sheet the user is meant to fill in. Then skip anything
 * named with a leading underscore, which is this codebase's convention for scaffolding, so a
 * template that forgets to hide its lists sheet still parses correctly.
 *
 * <p>Deliberately not "the sheet called Users or Assets": people rename tabs, and a file exported
 * from another system has neither name. Falling back to the first sheet keeps those working.
 */
export function pickDataSheet(workbook: XLSX.WorkBook): string | undefined {
    const properties = workbook.Workbook?.Sheets ?? [];
    const visible = workbook.SheetNames.filter((_, index) => (properties[index]?.Hidden ?? 0) === 0);

    const candidates = visible.length > 0 ? visible : workbook.SheetNames;
    return candidates.find((name) => !name.startsWith('_')) ?? candidates[0];
}

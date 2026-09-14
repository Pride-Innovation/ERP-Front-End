/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ExportTable, defaultColumnKeys, findExportTable } from './exportTables';

/** `{ tableKey: [columnKey, …] }`. A table that is absent has not been configured. */
export type ExportColumnConfig = Record<string, string[]>;

/*
 * Deliberately free of the HTTP module.
 *
 * These are the decisions — which columns, in which order, and what an absent or stale answer
 * means — and they are the part worth testing. Keeping them apart from `fetchExportColumnConfig`
 * means a unit test does not have to stand up axios to ask "what happens when nobody has configured
 * this table", which is the question most likely to be got wrong.
 */

/* ── The viewer's own narrowing ──────────────────────────────────────────────────────────────── */

const STORAGE_PREFIX = 'exportColumns:';

/**
 * What this viewer last chose for this table, if anything.
 *
 * <p>Deliberately in `localStorage` rather than on the server. It is a per-person convenience — "I
 * do not want the cost column in *my* copy" — and the shared default is the thing that belongs to
 * everybody. Keeping the two apart is what stops one person tidying their own report and quietly
 * changing what the whole bank prints.
 *
 * <p>Wrapped, because the accessor itself throws in a private window or with site data blocked, and
 * an export must not fail over a remembered preference.
 */
export const readViewerChoice = (tableKey: string): string[] | null => {
    try {
        const raw = window.localStorage.getItem(STORAGE_PREFIX + tableKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((key) => typeof key === 'string') : null;
    } catch {
        return null;
    }
};

export const writeViewerChoice = (tableKey: string, columnKeys: string[]): void => {
    try {
        window.localStorage.setItem(STORAGE_PREFIX + tableKey, JSON.stringify(columnKeys));
    } catch {
        /* A preference that cannot be remembered is not worth failing an export over. */
    }
};

export const clearViewerChoice = (tableKey: string): void => {
    try {
        window.localStorage.removeItem(STORAGE_PREFIX + tableKey);
    } catch { /* as above */ }
};

/* ── Resolution ──────────────────────────────────────────────────────────────────────────────── */

/**
 * The columns a table should export, in file order.
 *
 * <h2>Three layers, narrowing</h2>
 * 1. The registry says which columns the table *has*, and in what order they read.
 * 2. The saved configuration, if any, says which of those are worth printing — set once, for
 *    everybody, by whoever holds `UPDATE_EXPORT_COLUMNS`.
 * 3. The viewer's own choice, if any, narrows that further for their copy alone.
 *
 * <h2>Absence is the widest answer here, and that is deliberate</h2>
 * A table with no saved configuration exports its defaults rather than nothing. This ships against
 * twenty-odd existing tables that nobody has configured, and the alternative is that every export in
 * the bank comes out blank on the day it deploys.
 *
 * <p>That only works because *absent* and *empty* are different states: the server refuses to store
 * an empty set, so a table that appears in the configuration always names at least one column. The
 * same rule in reverse to the "allowed ids" trap recorded in CLAUDE.md — what matters is that the
 * meaning of emptiness was decided rather than stumbled into.
 *
 * <p>A viewer's stored choice is intersected, never unioned: if the configuration later drops a
 * column, somebody who had ticked it does not keep it. The shared decision wins.
 */
export const resolveExportColumns = (
    tableKey: string | undefined,
    config: ExportColumnConfig,
    viewerChoice?: string[] | null,
): string[] | null => {
    const table = findExportTable(tableKey);
    if (!table) return null;   // Unregistered: the caller keeps today's behaviour.

    const configured = config[table.key];
    const allowed = configured && configured.length > 0 ? configured : defaultColumnKeys(table);

    if (!viewerChoice) return allowed;

    const chosen = new Set(viewerChoice);
    const narrowed = allowed.filter((key) => chosen.has(key));

    // A stored choice that now matches nothing — every column it named has since been dropped from
    // the configuration — is treated as no choice at all. Returning an empty file because of a
    // preference somebody set months ago is the worst of both.
    return narrowed.length > 0 ? narrowed : allowed;
};

/**
 * Applies the resolved column list to a set of export columns.
 *
 * <p>Both exporters — `exportListPdf` and `listSheet` — already take `{ title, dataKey }[]`, so this
 * is a filter over what a page already builds rather than a second way of describing a column. A
 * page cannot end up with a PDF and a spreadsheet that disagree.
 *
 * @param columns what the page would have exported
 * @param keys    the resolved list, or `null` for an unregistered table (everything passes)
 */
export const applyExportColumns = <T extends { dataKey: string }>(
    columns: T[],
    keys: string[] | null,
): T[] => {
    if (!keys) return columns;

    const wanted = new Set(keys);
    const kept = columns.filter((column) => wanted.has(column.dataKey));

    // Order by the resolved list, so the configured reading order is what the file carries rather
    // than the order the row object happened to be built in.
    kept.sort((a, b) => keys.indexOf(a.dataKey) - keys.indexOf(b.dataKey));

    /*
     * If the filter matches nothing the page exports what it had.
     *
     * That happens when a registry key and a row key drift apart — someone renames a field in a
     * mapper and forgets this file. The honest failure there is a file with too many columns, not an
     * empty one: the first is untidy, the second looks like the export is broken.
     */
    return kept.length > 0 ? kept : columns;
};

/** Column definitions for the editor, in registry order. */
export const columnsForTable = (tableKey: string): ExportTable['columns'] =>
    findExportTable(tableKey)?.columns ?? [];


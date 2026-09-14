/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { applyExportColumns, resolveExportColumns } from './resolveExportColumns';
import { EXPORT_TABLES, defaultColumnKeys, findExportTable } from './exportTables';

/**
 * Resolving a table's export columns.
 *
 * <p>The behaviour worth pinning is what happens when something is *missing* — an unconfigured
 * table, a stale viewer preference, a registry key that no longer matches a row. Each of those has
 * an obvious wrong answer that produces an empty file, and an empty file reads to the user as a
 * broken export rather than as a setting.
 */
describe('export column resolution', () => {

    /**
     * The default that matters most: this feature arrives against twenty-odd tables nobody has
     * configured, and the alternative to "export everything" is that every download in the bank
     * comes out blank on the day it ships.
     */
    it('exports a table\'s defaults when nothing is configured', () => {
        const table = findExportTable('assets');
        expect(table).toBeDefined();

        expect(resolveExportColumns('assets', {}, null))
            .toEqual(defaultColumnKeys(table!));
    });

    it('returns null for a table that is not in the registry, so the caller keeps its behaviour', () => {
        expect(resolveExportColumns('no-such-table', {}, null)).toBeNull();
        expect(resolveExportColumns(undefined, {}, null)).toBeNull();
    });

    it('uses the saved configuration over the defaults', () => {
        expect(resolveExportColumns('assets', { assets: ['assetName', 'status'] }, null))
            .toEqual(['assetName', 'status']);
    });

    it('narrows the configuration by the viewer\'s own choice', () => {
        const config = { assets: ['assetName', 'status', 'location'] };

        expect(resolveExportColumns('assets', config, ['assetName', 'location']))
            .toEqual(['assetName', 'location']);
    });

    /**
     * The shared decision wins over a personal one.
     *
     * <p>A viewer who ticked a column months ago must not keep it after it has been dropped from the
     * configuration — otherwise the one thing the permission is for, deciding what the bank's
     * reports contain, would be quietly overridden by everyone's browser.
     */
    it('never lets a stored choice re-add a column the configuration dropped', () => {
        const config = { assets: ['assetName', 'status'] };

        expect(resolveExportColumns('assets', config, ['assetName', 'location']))
            .toEqual(['assetName']);
    });

    /**
     * A preference that has gone completely stale is treated as no preference.
     *
     * <p>The alternative is an empty file, produced by a choice somebody made months ago and has
     * long forgotten — the least explicable possible failure.
     */
    it('falls back to the configuration when a stored choice matches nothing', () => {
        const config = { assets: ['assetName', 'status'] };

        expect(resolveExportColumns('assets', config, ['somethingRemovedLongAgo']))
            .toEqual(['assetName', 'status']);
    });

    /** An empty saved list is treated as unconfigured — the server refuses to store one anyway. */
    it('treats an empty configured list as unconfigured rather than as nothing', () => {
        const table = findExportTable('assets')!;

        expect(resolveExportColumns('assets', { assets: [] }, null))
            .toEqual(defaultColumnKeys(table));
    });
});

describe('applying columns to an export', () => {

    const columns = [
        { title: 'Asset name', dataKey: 'assetName' },
        { title: 'Status', dataKey: 'status' },
        { title: 'Location', dataKey: 'location' },
    ];

    it('keeps only the resolved columns', () => {
        expect(applyExportColumns(columns, ['assetName', 'location']).map((c) => c.dataKey))
            .toEqual(['assetName', 'location']);
    });

    it('orders them as resolved, not as the row happened to be built', () => {
        expect(applyExportColumns(columns, ['location', 'assetName']).map((c) => c.dataKey))
            .toEqual(['location', 'assetName']);
    });

    it('passes everything through for an unregistered table', () => {
        expect(applyExportColumns(columns, null)).toEqual(columns);
    });

    /**
     * The drift case: a registry key and a row key stop matching because somebody renamed a field in
     * a mapper. Too many columns is untidy; none at all looks like the export is broken, so the
     * failure is deliberately the first one.
     */
    it('falls back to every column when the keys match nothing', () => {
        expect(applyExportColumns(columns, ['renamedInSomeMapper'])).toEqual(columns);
    });
});

describe('the registry itself', () => {

    it('has unique keys, since they are what the saved configuration points at', () => {
        const keys = EXPORT_TABLES.map((table) => table.key);
        expect(new Set(keys).size).toBe(keys.length);
    });

    it('gives every table at least one default column', () => {
        EXPORT_TABLES.forEach((table) => {
            expect(defaultColumnKeys(table).length).toBeGreaterThan(0);
        });
    });

    it('has unique column keys within each table', () => {
        EXPORT_TABLES.forEach((table) => {
            const keys = table.columns.map((column) => column.key);
            expect(new Set(keys).size).toBe(keys.length);
        });
    });
});

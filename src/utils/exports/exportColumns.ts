/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from '../../core/apis/axiosInstance';
import { EXPORT_TABLES, defaultColumnKeys, findExportTable } from './exportTables';
import { ExportColumnConfig } from './resolveExportColumns';

/**
 * The configured columns for every table.
 *
 * <p>Open to any signed-in user by design: every export in the application consults this before
 * building a file, so gating the read on the permission that *changes* it would refuse the download
 * to everyone who is not an administrator.
 *
 * <p>Failure is not fatal and must not be. If this call fails the exports fall back to their
 * defaults rather than producing nothing — a configuration service being unreachable is not a reason
 * to stop people getting their reports out.
 */
export const fetchExportColumnConfig = async (): Promise<ExportColumnConfig> => {
    try {
        const { data } = await axiosInstance.get('export-columns');
        return (data as ExportColumnConfig) ?? {};
    } catch (error) {
        console.warn('Export column configuration unavailable; falling back to defaults', error);
        return {};
    }
};

/**
 * The configuration, fetched once per page load and shared by every exporter.
 *
 * <p>Cached because a register with four export buttons should not make four identical calls, and
 * because the alternative — threading it through a provider — would mean every page that exports
 * has to remember to subscribe. Invalidated when the editor saves, so an administrator sees their
 * own change take effect without a reload.
 */
let cached: Promise<ExportColumnConfig> | null = null;

export const loadExportColumnConfig = (): Promise<ExportColumnConfig> => {
    if (!cached) cached = fetchExportColumnConfig();
    return cached;
};

/** Drops the cache so the next export re-reads the configuration. */
export const invalidateExportColumnConfig = (): void => { cached = null; };

/** Replaces one table's configuration. Requires `UPDATE_EXPORT_COLUMNS`. */
export const saveExportColumnConfig = async (tableKey: string, columnKeys: string[]) => {
    const response = await axiosInstance.put(`export-columns/${tableKey}`, columnKeys);
    invalidateExportColumnConfig();
    return response;
};

/** Puts a table back to exporting every column it has. Requires `UPDATE_EXPORT_COLUMNS`. */
export const resetExportColumnConfig = async (tableKey: string) => {
    const response = await axiosInstance.delete(`export-columns/${tableKey}`);
    invalidateExportColumnConfig();
    return response;
};

/*
 * Re-exported so nothing had to move when the pure half was split out for testing. One import path
 * for callers, two files for the two different kinds of thing.
 */
export * from './resolveExportColumns';
export { EXPORT_TABLES, defaultColumnKeys, findExportTable };

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useCallback, useEffect, useRef, useState } from 'react';
import { ReportShellFilters } from './ReportShell';

/**
 * The fetch-and-map cycle every report panel repeats.
 *
 * <p>Each panel previously held a `MOCK_ROWS` constant and filtered it in memory, so none of them
 * had a loading state, an error state, or an empty state — conditions that simply could not arise.
 * Real data has all three, and a panel that shows a blank table for any of them is unreadable.
 *
 * @param fetcher maps the current filters to rows. Panels decide for themselves what goes to the
 *                server and what is narrowed in the browser, because the endpoints differ widely in
 *                what they support.
 */
/**
 * How many records a report reads in one go.
 *
 * <p>Every panel fetches a single page and works from it. That is fine at the bank's present volume
 * — measured when this was written: 252 assets, 68 movements, 52 requests, 42 stock orders — but it
 * is a cap, and a report that silently stops at one is the worst kind, because the file and the
 * totals look complete. Raised from the 300/500 each panel had invented for itself, and now
 * *reported* rather than hidden (see {@link truncationNotice}).
 */
export const REPORT_PAGE_SIZE = 1000;

/**
 * Says so when the server had more than this report read.
 *
 * <p>The alternative is what was there before: the table pages locally over whatever arrived and
 * shows `count={rows.length}`, so the pager reads "1–25 of 300" as though 300 were the total, and
 * the summary cards total the truncated set. Two kinds of number on one screen, with nothing saying
 * which is which — the same fault the movements register had before it was paged properly.
 */
export const truncationNotice = (res: any, noun: string): string | undefined => {
    const total = Number(res?.data?.totalElements);
    const read = (res?.data?.content ?? []).length;
    if (!Number.isFinite(total) || read >= total) return undefined;
    return `Showing the most recent ${read.toLocaleString()} of ${total.toLocaleString()} ${noun}. `
        + 'Narrow the filters to bring the rest into range — totals and exports cover only what is shown.';
};

/** Joins what a panel has to say, dropping the parts that do not apply. */
export const combineNotices = (...parts: Array<string | undefined>): string | undefined =>
    parts.filter(Boolean).join(' ') || undefined;

/** A panel may return rows alone, or rows with something the reader needs told. */
type FetchResult<T> = T[] | { rows: T[]; notice?: string };

const useReportData = <T,>(fetcher: (filters: ReportShellFilters) => Promise<FetchResult<T>>) => {
    const [rows, setRows] = useState<T[]>([]);
    const [notice, setNotice] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<ReportShellFilters>({});

    /**
     * Held in a ref so `load` stays stable across renders. Panels build their fetcher inline, which
     * makes it a new function every render — as a dependency it would loop the effect forever.
     */
    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    const load = useCallback(async (f: ReportShellFilters) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetcherRef.current(f);
            if (Array.isArray(result)) {
                setRows(result);
                setNotice(null);
            } else {
                setRows(result.rows);
                setNotice(result.notice ?? null);
            }
        } catch (e) {
            // Surfaced, not swallowed: an empty table caused by a failed call must not look like a
            // report that legitimately found nothing.
            setError('Could not load this report. Please try again.');
            setRows([]);
            setNotice(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(filters); }, [load, filters]);

    return {
        rows,
        /** Set when the report read less than the server holds. Wire to ReportShell's `notice`. */
        notice,
        loading,
        error,
        filters,
        /** Wire to ReportShell's `onApplyFilters`. */
        applyFilters: setFilters,
        /** Wire to ReportShell's `onRefresh`. */
        refresh: () => load(filters),
    };
};

export default useReportData;

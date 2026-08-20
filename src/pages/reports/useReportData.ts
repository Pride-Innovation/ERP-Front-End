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
const useReportData = <T,>(fetcher: (filters: ReportShellFilters) => Promise<T[]>) => {
    const [rows, setRows] = useState<T[]>([]);
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
            setRows(await fetcherRef.current(f));
        } catch (e) {
            // Surfaced, not swallowed: an empty table caused by a failed call must not look like a
            // report that legitimately found nothing.
            setError('Could not load this report. Please try again.');
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(filters); }, [load, filters]);

    return {
        rows,
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

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import { fetchRowsService } from '../../core/apis/globalService';

/**
 * The branch / department / category / status directories the report filters offer.
 *
 * <p>These were four hardcoded arrays of display names in ReportShell — a fixed five branches and
 * six departments that had no relationship to what the bank actually has. Worse, they emitted
 * *labels* while every backend filter takes an *id*, so nothing they produced could be sent to a
 * server-side query.
 *
 * <p>Each option therefore carries both: `id` does the querying, `label` does the display and lands
 * in the exported file.
 */

export interface LookupOption {
    id: number | string;
    label: string;
    /**
     * Status only — the stable camelCase code (`issuanceAvailable`) that the rest of the app matches
     * on, as opposed to the display name ("Available for Issuance") which is free to change.
     */
    code?: string;
}

export interface ReportLookups {
    branches: LookupOption[];
    departments: LookupOption[];
    categories: LookupOption[];
    statuses: LookupOption[];
    loading: boolean;
}

/** One page big enough to hold every row of a directory that realistically numbers in the dozens. */
const ALL = 500;

const toOptions = (rows: any[], labelKey = 'name'): LookupOption[] =>
    (rows ?? [])
        .filter((r) => r && r.id != null)
        // `status` is the Status entity's camelCase code field; `code` covers anything else that
        // carries one. Neither exists on branches/departments/asset-types, which is harmless.
        .map((r) => ({ id: r.id, label: r[labelKey] ?? String(r.id), code: r.status ?? r.code }))
        .sort((a, b) => a.label.localeCompare(b.label));

/**
 * Loads every directory the filter bar needs, once.
 *
 * <p>A failed lookup yields an empty list rather than throwing: a report whose Branch dropdown is
 * empty is still a usable report, whereas one that refuses to render because a directory call
 * failed is not.
 */
const useReportLookups = (): ReportLookups => {
    const [branches, setBranches] = useState<LookupOption[]>([]);
    const [departments, setDepartments] = useState<LookupOption[]>([]);
    const [categories, setCategories] = useState<LookupOption[]>([]);
    const [statuses, setStatuses] = useState<LookupOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const get = async (endPoint: string) => {
                const r = (await fetchRowsService({ pageNumber: 0, pageSize: ALL, endPoint })) as any;
                if (r?.status !== 200) return [];
                // Paged endpoints answer { content: [...] }; plain ones answer an array.
                return Array.isArray(r.data) ? r.data : r.data?.content ?? [];
            };

            const [b, d, c, s] = await Promise.all([
                get('branches'),
                get('departments'),
                get('asset-types'),
                get('statuses'),
            ]);

            if (cancelled) return;
            setBranches(toOptions(b));
            setDepartments(toOptions(d));
            setCategories(toOptions(c));
            setStatuses(toOptions(s));
            setLoading(false);
        })();

        return () => { cancelled = true; };
    }, []);

    return { branches, departments, categories, statuses, loading };
};

export default useReportLookups;

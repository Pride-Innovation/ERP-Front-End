/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import { fetchAllDepartments } from '../../users/service/referenceData';

export interface IDepartmentOption {
    value: number;
    label: string;
}

/**
 * The departments behind the request tabs' Department filter.
 *
 * <h2>A hook, because four tabs need the same list</h2>
 * All four request tabs share `buildRequestColumnFilters`, so they all need the same options. Fetched
 * once per tab rather than lifted into a context: it is a dozen rows that change about never, and a
 * context mounted at the app root for this would outlive the page that uses it — which is exactly how
 * `StoreContext` came to hand a page the previous branch's rows.
 *
 * <h2>A failure costs only this filter</h2>
 * The call is settled on its own and its failure is swallowed to an empty list, so a refused or slow
 * `GET /departments` leaves the other five filters working. The users page once loaded its four
 * lookups in a single `Promise.all`, and a 403 on one of them emptied all four dropdowns with a
 * `console.warn` as the only trace.
 *
 * <p>An empty list renders as a Department dropdown with nothing in it, which is honest — it offers
 * no value that would match nothing.
 */
export const useDepartmentOptions = (): IDepartmentOption[] => {
    const [departments, setDepartments] = useState<IDepartmentOption[]>([]);

    useEffect(() => {
        let cancelled = false;

        fetchAllDepartments()
            .then((options) => {
                if (!cancelled) setDepartments(options as IDepartmentOption[]);
            })
            .catch((error) => {
                // Not toasted: a filter that could not load its options is not something the user
                // asked for and cannot act on, and the page is still fully usable without it.
                console.warn('Failed to load departments for the request filter', error);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return departments;
};

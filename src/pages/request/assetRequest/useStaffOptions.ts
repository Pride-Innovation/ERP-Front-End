/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useCallback } from 'react';
import { fetchStaffOptionsService, staffOptionLabel } from '../../users/service/staffPicker';
import { IFilterOptionPage } from '../../../components/tables/interface';

/**
 * The people behind the "Requested By" and "Approver" pickers on every request tab.
 *
 * <h2>Why a hook rather than a constant</h2>
 * All four tabs — All Requests, Pending, Rejected, Issued — offer the same two filters, so they must
 * offer the same list from the same place. Written once, memoised per page, and handed to
 * `buildRequestColumnFilters`.
 *
 * <h2>Scoping, and the permission it used to demand</h2>
 * This read `GET /users` — the **staff directory** — so filtering a request list by requester
 * required `READ_USER`, which also opens the Users page and needs `READ_ROLE` behind it. An officer
 * could not use the filters on their own requests without administrative rights.
 *
 * <p>It reads `GET /users/picker` now, which applies **the same branch scope** and answers to
 * authentication alone. Nothing about who appears in the list changed: a branch user is offered their
 * own duty station's staff, Head Office and the units see everyone. That scoping matters more than it
 * looks — a picker offering people the listing would never return reads as a filter that silently
 * finds nothing, and the user cannot tell that from a wrong guess.
 *
 * <p>Nothing here widens what the listing returns. Both filters narrow within whatever scope the
 * caller already has, which is why the request scope predicate still applies alongside them.
 */
const useStaffOptions = () => useCallback(
    async (query: string, page: number, pageSize: number): Promise<IFilterOptionPage> => {
        try {
            const { content, totalElements } = await fetchStaffOptionsService({
                name: query, pageNumber: page, pageSize,
            });
            return {
                options: content.map((u) => ({ value: u.id, label: staffOptionLabel(u) })),
                totalElements,
            };
        } catch {
            // An empty picker is visible in the filter bar; a toast over a dropdown is not.
            return { options: [], totalElements: 0 };
        }
    },
    [],
);

export default useStaffOptions;

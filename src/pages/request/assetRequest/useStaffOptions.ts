/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useCallback } from 'react';
import { fetchUsersService } from '../../users/service';
import { IFilterOptionPage } from '../../../components/tables/interface';

/**
 * The people behind the "Requested By" and "Approver" pickers on every request tab.
 *
 * <h2>Why a hook rather than a constant</h2>
 * All four tabs — All Requests, Pending, Rejected, Issued — offer the same two filters, so they must
 * offer the same list from the same place. Written once, memoised per page, and handed to
 * `buildRequestColumnFilters`.
 *
 * <h2>Scoping</h2>
 * This is the same `GET /users` the assets page's "Assigned To" filter uses, and it is **branch-scoped
 * on the server**: a branch user is offered their own duty station's staff, while Head Office and the
 * units see everyone. That matters more than it looks — a picker that offered people the listing
 * would never return reads as a filter that silently finds nothing, and the user has no way to tell
 * an empty result from a wrong guess.
 *
 * <p>Nothing here widens what the listing returns. Both filters narrow within whatever scope the
 * caller already has, which is why the request scope predicate still applies alongside them.
 */
const useStaffOptions = () => useCallback(
    async (query: string, page: number, pageSize: number): Promise<IFilterOptionPage> => {
        const res: any = await fetchUsersService({
            name: query?.trim() || undefined,
            pageNumber: page,
            pageSize,
        });
        if (res?.status !== 200) return { options: [], totalElements: 0 };

        const content = res.data?.content ?? [];
        return {
            options: content.map((u: any) => ({
                value: u.id,
                // Surname first, matching how the request table's own columns read.
                label: [u.lastName, u.firstName].filter(Boolean).join(' ') || u.email || `User ${u.id}`,
            })),
            totalElements: res.data?.totalElements ?? content.length,
        };
    },
    [],
);

export default useStaffOptions;

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IColumnFilter } from '../../../components/tables/interface';
import { IStatus } from '../../settings/statuses/interface';

/**
 * One definition of the request tables' filters, sort and parameter mapping.
 *
 * <p>All four tabs — All, Pending, Rejected, Issued — carried their own copy of this block, and the
 * copies had drifted: three of the five filters named parameters `GET /requests` does not declare,
 * and the Status dropdown offered Active / Disabled / Locked, which are user-account states copied
 * from the users page. Spring discards an undeclared parameter silently, so those filters looked
 * like they worked and returned the unfiltered list.
 *
 * <p>Sharing it is the point: a fifth tab gets the corrected behaviour for free, and a change to the
 * endpoint's parameters is made once rather than four times.
 */

/**
 * Statuses a request can actually be in.
 *
 * The status table is shared with assets, stock and the approval ladders, so listing all of it would
 * offer things like "In Maintenance" that no request ever holds.
 */
export const REQUEST_STATUS_CODES = [
    'requestCreated', 'requestApproved', 'managerApproved', 'hodApproved', 'bomApproved',
    'branchManagerApproved', 'supervisorApproved', 'requestAcknowledged', 'requestRejected',
    'issued', 'issuanceApproved', 'requestIssued', 'receiptAcknowledged',
];

/** Row keys the Request table can genuinely be ordered by, mapped to their entity column. */
export const REQUEST_SORT_FIELDS: Record<string, string> = {
    name: 'name',
    priority: 'priority',
    requestDate: 'createDate',
};

/** The field the toolbar's search box filters on. `GET /requests` declares `name`. */
export const REQUEST_SEARCH_KEY = 'name';

/**
 * The filter controls, in order.
 *
 * @param statuses the status catalogue, used to offer real request statuses rather than a
 *                 hardcoded list that goes stale the moment someone adds one
 */
export const buildRequestColumnFilters = (statuses: IStatus[]): IColumnFilter[] => [
    { key: 'name', label: 'Request Title', type: 'text' },
    { key: 'requestedBy', label: 'Requested By', type: 'text' },
    { key: 'approver', label: 'Approver', type: 'text' },
    {
        key: 'priority', label: 'Priority', type: 'select', options: [
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
        ],
    },
    {
        key: 'statusIds', label: 'Status', type: 'select',
        options: statuses
            .filter((s) => s.id != null && REQUEST_STATUS_CODES.includes(s.status ?? ''))
            .map((s) => ({ value: s.id as number, label: s.name })),
    },
    { key: 'requestDate', label: 'Request Created', type: 'dateRange' },
];

/**
 * Translates the toolbar's flat filter object into the parameters `GET /requests` declares, then
 * merges it over the tab's own base parameters.
 *
 * <p>The merge is the important half. Each tab called
 * {@code onApplyFilters={(filters) => fetchAllRequests(filters)}}, which *replaced* the request
 * parameters rather than adding to them — so applying any filter on the Rejected tab dropped its
 * `statusIds` and listed every request in the system under a heading that said "Rejected". Pending
 * lost its approver scoping the same way.
 *
 * <p>Filters win over the base where they overlap, so a user narrowing Status inside a tab gets what
 * they asked for; everything the tab needs to stay itself survives underneath.
 *
 * @param base   what the tab always sends — its status ids, its approver scoping
 * @param filters what the user just applied
 */
export const toRequestParams = (
    base: Record<string, any>,
    filters: Record<string, any>,
): Record<string, any> => {
    const { requestDateFrom, requestDateTo, statusIds, ...rest } = filters ?? {};
    return {
        ...base,
        ...rest,
        // A single id from the dropdown; the endpoint takes a list, and a chosen status must narrow
        // the tab rather than sit alongside its own.
        ...(statusIds ? { statusIds: String(statusIds) } : {}),
        // The toolbar names a date range after its column key; the endpoint wants start/end.
        ...(requestDateFrom ? { startDate: requestDateFrom } : {}),
        ...(requestDateTo ? { endDate: requestDateTo } : {}),
    };
};

/** Names the slice being exported, so the PDF strip and the Excel cover say what it is. */
export const buildRequestFilterSummary = (
    params: Record<string, any>,
    statuses: IStatus[],
    tabLabel: string,
): Array<{ label: string; value: string }> => {
    const out: Array<{ label: string; value: string }> = [{ label: 'View', value: tabLabel }];

    if (params.name) out.push({ label: 'Request Title', value: String(params.name) });
    if (params.requestedBy) out.push({ label: 'Requested By', value: String(params.requestedBy) });
    if (params.approver) out.push({ label: 'Approver', value: String(params.approver) });
    if (params.priority) out.push({ label: 'Priority', value: String(params.priority) });
    if (params.statusIds) {
        const names = String(params.statusIds).split(',')
            .map((id) => statuses.find((s) => s.id === Number(id))?.name)
            .filter(Boolean);
        if (names.length) out.push({ label: 'Status', value: names.join(', ') });
    }
    if (params.startDate || params.endDate) {
        const d = (v?: string) => (v ? new Date(v).toLocaleDateString('en-GB') : '…');
        out.push({ label: 'Requested', value: `${d(params.startDate)} – ${d(params.endDate)}` });
    }
    return out;
};

/** Hard cap on a filter-aware export; anything larger should be narrowed first. */
export const REQUEST_EXPORT_MAX_ROWS = 10_000;

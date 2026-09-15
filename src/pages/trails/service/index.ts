/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from '../../../core/apis/axiosInstance';
import { IAuditTrail, IAuditTrailQuery, IAuditTrailSummary } from '../interface';

const ENDPOINT = 'audit/trails';

export interface AuditTrailPage {
    rows: IAuditTrail[];
    totalElements: number;
}

/** `All` is what the dropdowns hold for "no filter"; sending it would filter on the literal word. */
const meaningful = (value?: string | null) =>
    (value && value.trim() && value !== 'All' ? value.trim() : undefined);

/**
 * A date input gives a day; the column holds an instant.
 *
 * Without widening the bounds, "from 13 Apr to 13 Apr" would match only events at exactly midnight
 * and the day's activity would appear to be empty.
 */
const startOfDay = (value?: string) => (value ? `${value}T00:00:00` : undefined);
const endOfDay = (value?: string) => (value ? `${value}T23:59:59` : undefined);

/**
 * Fetches a page of the activity log.
 *
 * Filtering and paging happen in SQL rather than in the browser: this is the largest table in the
 * database and it grows on every write in the application, so fetching it to narrow it here would
 * stop working long before anyone noticed why.
 *
 * Throws rather than returning the error. Most services in this app `catch (error) { return error }`,
 * which leaves the caller unable to tell a failure from an empty result — and on this page those two
 * mean very different things.
 */
export const fetchAuditTrailsService = async (query: IAuditTrailQuery): Promise<AuditTrailPage> => {
    const res = await axiosInstance.get(ENDPOINT, {
        params: {
            search: meaningful(query.search),
            eventType: meaningful(query.eventType),
            module: meaningful(query.module),
            severity: meaningful(query.severity),
            /*
             * The forensic three. `GET /audit/trails` has declared all of them since it was written
             * and nothing ever sent them, so "everything this person did" and "everything that
             * happened to request #37" could only be approached by typing a name into free-text
             * search — which also matches anyone whose description merely mentions them.
             */
            actorId: query.actorId,
            entityType: meaningful(query.entityType),
            entityId: query.entityId,
            from: startOfDay(query.dateFrom),
            to: endOfDay(query.dateTo),
            pageNumber: query.pageNumber ?? 0,
            pageSize: query.pageSize ?? 25,
            background: query.background ?? false,
        },
    });
    return {
        rows: res.data?.content ?? [],
        totalElements: res.data?.totalElements ?? 0,
    };
};

/**
 * The four tiles, over the rows the current filters describe.
 *
 * <p>This took no parameters, so the figures above a narrowed table described the whole log: filter
 * to "critical events in Movement last week" and the tiles still read the totals for everything.
 * Two kinds of number on one screen, with nothing saying which was which.
 *
 * <p>It takes the same filters as the listing, built the same way, so the two cannot come to
 * describe different things.
 */
export const fetchAuditTrailSummaryService = async (
    query: IAuditTrailQuery = {},
): Promise<IAuditTrailSummary> => {
    const res = await axiosInstance.get(`${ENDPOINT}/summary`, {
        params: {
            search: meaningful(query.search),
            eventType: meaningful(query.eventType),
            module: meaningful(query.module),
            severity: meaningful(query.severity),
            actorId: query.actorId,
            entityType: meaningful(query.entityType),
            entityId: query.entityId,
            from: startOfDay(query.dateFrom),
            to: endOfDay(query.dateTo),
        },
    });
    return res.data;
};

/**
 * Tells the server that a report was exported.
 *
 * Ordinary page views are not audited — they would be the overwhelming majority of rows and would
 * bury the events that matter. Exports are the exception: that is data leaving the building.
 *
 * Deliberately swallows its errors. A failure to record the export must not stop the user getting
 * their file, and they have already been handed it by the time this runs.
 */
export const recordExportService = async (body: {
    module: string;
    reportName: string;
    format: 'PDF' | 'Excel' | 'CSV';
    rowCount: number;
}) => {
    try {
        return await axiosInstance.post('audit/exports', body);
    } catch (error) {
        return error;
    }
};

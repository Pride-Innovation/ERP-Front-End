/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * One row of the activity log.
 *
 * `event`, `module` and `severity` arrive already lower-cased (or, for module, as the display label)
 * from the backend, so they key straight into the chip config on the page without translation.
 *
 * They are plain strings rather than unions: the backend enums will grow, and a union here would turn
 * every new event type the server starts sending into a compile error in the browser instead of a new
 * chip. The chip lookups already fall back for anything unrecognised.
 */
export interface IAuditTrail {
    id: string | number;
    /** ISO timestamp from the server; formatted for display on the page. */
    timeStamp: string;
    event: string;
    module: string;
    /** Machine-readable code, e.g. MOVEMENT_APPROVAL_BYPASSED. Not shown, but exported and searchable. */
    action?: string;
    description: string;
    actor: string;
    actorId?: number | null;
    actorEmail?: string | null;
    /** The record affected, when the event was about one. */
    entityType?: string | null;
    entityId?: number | null;
    ipAddress: string;
    severity: string;
}

/**
 * The four tiles above the table.
 *
 * Counted server-side over the whole table: with the list paged in SQL the page only ever holds
 * twenty-five rows and cannot derive a total from them.
 */
export interface IAuditTrailSummary {
    totalEvents: number;
    eventsToday: number;
    activeActors: number;
    flaggedEvents: number;
}

/** What the filter bar sends. Empty strings and `All` mean "no filter" and are dropped in the service. */
export interface IAuditTrailQuery {
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    eventType?: string;
    module?: string;
    severity?: string;
    pageNumber?: number;
    pageSize?: number;
    /** Set on auto-refresh ticks so polling is not recorded as somebody reading the log. */
    background?: boolean;
}

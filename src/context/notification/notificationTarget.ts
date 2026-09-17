/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ROUTES } from '../../core/routes/routes';
import { IAppNotification } from './service';

/**
 * Where a notification takes you, and what kind of thing it is about.
 *
 * <h2>Why the frontend resolves this</h2>
 * Notifications used to arrive with a fully-formed URL built in Java. Measured when that was
 * removed: **744 of 760 pointed at a route that does not exist** — they used a query parameter where
 * the route takes a path segment — and all 760 were absolute, including a host from configuration.
 * Nobody noticed, because nothing ever followed them: the page and the bell only marked things read.
 *
 * <p>Java cannot know when a route is renamed, so a URL written there is a guess that ages silently.
 * The server now says *what* the notification is about; turning that into a route happens here,
 * against `ROUTES` — one place, and a rename is a one-line change rather than a table full of dead
 * links.
 */

/** Everything a row needs to render itself and know where it goes. */
export interface NotificationKind {
    /** Short label for the chip on the row. */
    label: string;
    /** Bucket used by the page's tiles and its Type filter. */
    group: 'action' | 'progress' | 'rejected' | 'completed' | 'other';
}

/**
 * The five types the server actually emits.
 *
 * <p>Measured across 760 live rows: `STEP_PENDING` 478, `STEP_APPROVED` 173, `MOVEMENT_PENDING` 45,
 * `WORKFLOW_COMPLETED` 40, `MOVEMENT_UPDATE` 24. The page knew only three of them, so **242 of 760 —
 * roughly a third, including every movement awaiting somebody's approval** — rendered as "Other"
 * with a generic icon and no tile of their own.
 *
 * <p>`STEP_REJECTED` has produced no rows yet simply because nothing has been rejected on this data;
 * it is a real type and belongs here.
 */
export const NOTIFICATION_KINDS: Record<string, NotificationKind> = {
    STEP_PENDING: { label: 'Action required', group: 'action' },
    MOVEMENT_PENDING: { label: 'Approval needed', group: 'action' },
    STEP_APPROVED: { label: 'Approved', group: 'progress' },
    MOVEMENT_UPDATE: { label: 'Movement update', group: 'progress' },
    STEP_REJECTED: { label: 'Rejected', group: 'rejected' },
    WORKFLOW_COMPLETED: { label: 'Completed', group: 'completed' },
};

/**
 * How a type is described when the client has not heard of it.
 *
 * <p>A server that starts sending a sixth kind should produce a readable row on an older client, not
 * a blank one — which is why the type travels as a string rather than something the two must agree
 * on in lockstep.
 */
export const kindOf = (type?: string | null): NotificationKind =>
    (type && NOTIFICATION_KINDS[type]) || { label: 'Update', group: 'other' };

/**
 * The in-app route a notification points at, or `null` when it points at nothing.
 *
 * <p>Null is a real answer and the caller must respect it: a notification with no target renders as
 * plain text rather than as something clickable. That is the honest rendering, and precisely what the
 * 744 dead links should have been doing.
 */
export const notificationRoute = (notification: IAppNotification): string | null => {
    const { entityType, entityId } = notification;
    if (!entityType || !entityId) return null;

    switch (entityType) {
        case 'REQUEST':
            // A path segment. The old links used `?id=`, which this route does not read — the single
            // reason almost every notification in the table led nowhere.
            return `${ROUTES.READ_REQUEST}/${entityId}`;
        case 'MOVEMENT':
            return `${ROUTES.READ_MOVEMENT}/${entityId}`;
        default:
            // An entity kind this client does not know. Better unclickable than wrong.
            return null;
    }
};

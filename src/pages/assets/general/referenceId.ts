/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * An id from whatever a form field holds: a number, a numeric string, an `{ id }` record or a
 * `{ value }` option. Missing or unreadable is `null`.
 *
 * <p>The asset update endpoint binds supplier, holder, branch, status, category and type as numbers,
 * and an object in any one of them fails the whole save with a JSON parse error. The edit page once
 * sent the supplier object of the sample asset it started from; this is the guard at the boundary so
 * that whatever shape a picker leaves behind, the request carries an id.
 */
export const referenceId = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value === 'string') {
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
    }
    if (typeof value === 'object') {
        const v = value as { id?: unknown; value?: unknown };
        return referenceId(v.id ?? v.value);
    }
    return null;
};

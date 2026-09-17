/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { PERMISSIONS } from './constants';
import usePermissions from './usePermissions';
import RoutesUtills from '../routes/utills';

/**
 * Whether the signed-in user may act on a <em>particular</em> record.
 *
 * <p>The companion to {@link usePermissions}, which answers the other half. `has(UPDATE_ASSET)` says
 * the endpoint will admit you; this says the record will. Both have to pass, and asking only the
 * first is how a page comes to offer a button that then returns 403.
 *
 * <p>Mirrors `AccessScopeService` on the backend, which is the authority. **If the two drift, the
 * page offers an action its endpoint refuses** — or, worse in the other direction, hides one the
 * user is entitled to with nothing on screen to say why. The resolution order below is the same one,
 * in the same order, for that reason.
 *
 * <p>Presentation only. Nothing here is a security boundary; the backend re-checks every one of
 * these on the request itself.
 */

/** How far a person may reach. A ladder — ALL includes BRANCH includes SELF. */
export type AccessScope = 'SELF' | 'BRANCH' | 'ALL';

/** The kinds of record whose reach can be widened beyond one branch. */
export type ScopeSubject = 'ASSETS' | 'REQUESTS' | 'MOVEMENTS' | 'INVENTORY';

export type ScopeAction = 'VIEW' | 'MANAGE';

/** The multiplier that widens each subject, per action. Mirrors `ScopeSubject` on the backend. */
const MULTIPLIERS: Record<ScopeSubject, Record<ScopeAction, string>> = {
    ASSETS: {
        VIEW: PERMISSIONS.VIEW_ALL_BRANCH_ASSETS,
        MANAGE: PERMISSIONS.MANAGE_ALL_BRANCH_ASSETS,
    },
    REQUESTS: {
        VIEW: PERMISSIONS.VIEW_ALL_BRANCH_REQUESTS,
        MANAGE: PERMISSIONS.MANAGE_ALL_BRANCH_REQUESTS,
    },
    MOVEMENTS: {
        VIEW: PERMISSIONS.VIEW_ALL_BRANCH_MOVEMENTS,
        MANAGE: PERMISSIONS.MANAGE_ALL_BRANCH_MOVEMENTS,
    },
    INVENTORY: {
        VIEW: PERMISSIONS.VIEW_ALL_BRANCH_INVENTORY,
        MANAGE: PERMISSIONS.MANAGE_ALL_BRANCH_INVENTORY,
    },
};

/** A record, described by the only two things reach depends on. */
export interface IScopedRecord {
    /** The branch the record belongs to. Null means unassigned, which is treated as in reach. */
    branchId?: string | number | null;
    /** The person who holds or raised it, where it has one. */
    ownerId?: string | number | null;
}

/**
 * Ids arrive as either string or number across this codebase's interfaces, so they are normalised
 * once here rather than cast at every call site — a `'3' === 3` comparison silently returns false
 * and would hide a control from the person who owns the record.
 */
const asId = (value: string | number | null | undefined): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
};

export const useAccessScope = () => {
    const { has, hasAny, isSuperAdmin } = usePermissions();
    const { getCurrentUser } = RoutesUtills();
    const user = getCurrentUser() as {
        id?: number;
        branch?: { id?: number } | null;
    } | null;

    const ownBranchId = typeof user?.branch?.id === 'number' ? user.branch.id : null;
    const currentUserId = typeof user?.id === 'number' ? user.id : null;

    /**
     * How far this user reaches for a subject and action.
     *
     * <p>Resolution order, matching the backend exactly: a multiplier, then the dashboard ladder
     * capped at BRANCH, then SELF. The one asymmetry is that `DASH_SCOPE_ALL` widens VIEW to ALL but
     * never MANAGE — seeing every branch's figures is not licence to change them.
     */
    const scopeFor = (subject: ScopeSubject, action: ScopeAction): AccessScope => {
        if (isSuperAdmin()) return 'ALL';
        if (has(MULTIPLIERS[subject][action])) return 'ALL';

        if (action === 'VIEW'
            && hasAny([PERMISSIONS.VIEW_ALL_BRANCHES, PERMISSIONS.DASH_SCOPE_ALL])) {
            return 'ALL';
        }

        if (has(PERMISSIONS.DASH_SCOPE_BRANCH)) return 'BRANCH';
        if (has(PERMISSIONS.DASH_SCOPE_SELF)) return 'SELF';

        // No explicit scope: the signal that governed reach before this model existed, so a role
        // nobody has configured yet is not narrowed on the day this deploys.
        const readsOrgData = hasAny([
            PERMISSIONS.READ_ASSET,
            PERMISSIONS.READ_REQUEST,
            PERMISSIONS.READ_STORE,
            PERMISSIONS.READ_INVENTORY,
        ]);
        return (readsOrgData && ownBranchId !== null) ? 'BRANCH' : 'SELF';
    };

    /**
     * The rule itself.
     *
     * <p>A record with no branch is treated as in reach, matching the backend. The alternative is
     * that an unassigned asset becomes invisible and unfixable to everyone but a cross-branch
     * holder, which is how the nullable-association bugs in this codebase have repeatedly presented.
     */
    const permits = (scope: AccessScope, record: IScopedRecord): boolean => {
        if (scope === 'ALL') return true;

        const branchId = asId(record.branchId);
        if (scope === 'BRANCH') {
            return branchId === null || branchId === ownBranchId;
        }

        const ownerId = asId(record.ownerId);
        if (ownerId !== null) return ownerId === currentUserId;
        return branchId === null || branchId === ownBranchId;
    };

    /** Whether this record is within reach for reading. */
    const canView = (subject: ScopeSubject, record: IScopedRecord): boolean =>
        permits(scopeFor(subject, 'VIEW'), record);

    /** Whether this record is within reach for changing. */
    const canManage = (subject: ScopeSubject, record: IScopedRecord): boolean =>
        permits(scopeFor(subject, 'MANAGE'), record);

    /**
     * As {@link canManage}, for a record that touches several branches at once.
     *
     * <p>A movement is the case this exists for: it has a source and a destination, and either end
     * may be a store's location or a person's duty station. The caller is in reach if **any** end is
     * theirs, which mirrors `requireCanManageAny` on the backend and the movements listing itself.
     * Ends that are absent are the ordinary case, not a fault — a return has no source store, an
     * issuance no source user — so nulls are ignored rather than treated as a branch.
     */
    const canManageAnyOf = (
        subject: ScopeSubject,
        branchIds: Array<string | number | null | undefined>,
        /**
         * The people named on the record, for subjects where SELF means "I am party to this".
         *
         * <p>A movement has no owner column: it has four ends and several person links, so at SELF
         * "mine" is whoever raised it, sent it, is receiving it, signed for it, or asked for the item
         * it carries. Mirrors `AccessScopeService.anyInReach` and `MovementSearchDao`'s SELF
         * predicate — if these three drift, the table offers a button the server refuses, or hides
         * one the user is entitled to.
         *
         * <p>Omit for subjects that scope by branch alone; the behaviour is then unchanged.
         */
        ownerIds?: Array<string | number | null | undefined>,
    ): boolean => {
        const scope = scopeFor(subject, 'MANAGE');
        const owners = (ownerIds ?? []).map(asId).filter((id): id is number => id !== null);

        /*
         * At SELF, being named on the record is the whole question — a record that names people and
         * not me is not mine, and falling through to the branch comparison would widen SELF back into
         * BRANCH.
         */
        if (scope === 'SELF' && owners.length > 0) {
            return currentUserId !== null && owners.includes(currentUserId);
        }

        const known = branchIds.map(asId).filter((id): id is number => id !== null);
        if (known.length === 0) return permits(scope, {});
        return known.some((branchId) => permits(scope, { branchId }));
    };

    /**
     * Hold the permission **and** have a multi-ended record in reach. The movement equivalent of
     * {@link canActOn}.
     */
    const canActOnAnyOf = (
        permission: string,
        subject: ScopeSubject,
        branchIds: Array<string | number | null | undefined>,
        ownerIds?: Array<string | number | null | undefined>,
    ): boolean => has(permission) && canManageAnyOf(subject, branchIds, ownerIds);

    /**
     * The common case: hold the permission **and** have the record in reach.
     *
     * <p>Most callers want this rather than the two separately — offering an action needs both, and
     * asking for one without the other is precisely the mistake this hook exists to prevent.
     */
    const canActOn = (
        permission: string,
        subject: ScopeSubject,
        record: IScopedRecord,
    ): boolean => has(permission) && canManage(subject, record);

    return {
        scopeFor, canView, canManage, canActOn,
        canManageAnyOf, canActOnAnyOf,
        ownBranchId, currentUserId,
    };
};

export default useAccessScope;

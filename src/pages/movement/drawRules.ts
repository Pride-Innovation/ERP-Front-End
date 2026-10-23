/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * What the movement form may offer, mirroring the server's form rules (MovementService#createFromForm).
 * The server stays the authority - it alone knows which assets are already on another open movement -
 * but the form should not offer what the server will refuse.
 */

/** Asset statuses that are not on the shelf: away, travelling, issued, or awaiting completion. */
export const NOT_MOVABLE_STATUSES = ['inMaintenance', 'pendingDisposal', 'inTransit', 'assetIssued', 'requireUpdate'];

interface IStoreLike { locationId?: number | null }

/** You draw from a store only at your own branch. The super administrator may draw from any. */
export const drawableStores = <T extends IStoreLike>(
    stores: T[], viewerBranchId: number | null | undefined, superAdmin: boolean,
): T[] => (superAdmin ? stores : stores.filter((s) => viewerBranchId != null && Number(s.locationId) === Number(viewerBranchId)));

interface IAssetLike {
    assignedTo?: unknown;
    temporaryPool?: boolean | null;
    deleted?: boolean | null;
    disposed?: boolean | null;
    assetStatus?: { status?: string | null } | null;
}

/** Assets free on the shelf: held by nobody, not a loaner, and not away, travelling or unfinished. */
export const movableAssets = <T extends IAssetLike>(assets: T[]): T[] =>
    assets.filter((a) => !a.assignedTo && !a.temporaryPool && !a.deleted && !a.disposed
        && !NOT_MOVABLE_STATUSES.includes(a.assetStatus?.status ?? ''));

interface IBalanceLike { quantity: number; available?: number | null }

/** What can still be promised: the server's figure when it sent one, else what is on hand. */
export const availableOf = (b: IBalanceLike): number => (b.available ?? b.quantity);

/** "Pens (8 available, 10 on hand)", or "(10 in stock)" when nothing is promised. */
export const balanceLabel = (b: IBalanceLike & { commodityName: string }): string => {
    const free = availableOf(b);
    return free === b.quantity
        ? `${b.commodityName} (${b.quantity} in stock)`
        : `${b.commodityName} (${free} available, ${b.quantity} on hand)`;
};

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * Where an asset is, named the way a reader wants it — with Head Office broken out by department.
 *
 * <h2>Two questions, two functions, and the difference is not cosmetic</h2>
 * An asset has a branch and it has a holder, and they are <b>different facts that routinely
 * disagree</b>. `asset.branch` means <em>where the asset physically is</em> — `relocateAsset` writes
 * the destination store's location on every transfer — so a Gulu laptop on the Head Office repair
 * bench has `branch = Head Office` while the person accountable for it is still at Gulu. Measured:
 * seven assets sit in maintenance at Head Office today, every one of them sent from Gulu.
 *
 * <p>So the register's column and the detail page are answering different questions, and collapsing
 * them into one helper would make one of the two lie:
 *
 * <ul>
 *   <li>{@link holderLocationLabel} — <b>who has it</b>. Prefers the holder, because a register is
 *       read to find out whose desk an item is on. This is what the "Location" column has always
 *       shown, and what the server's own location filter matches.</li>
 *   <li>{@link assetLocationLabel} — <b>where it is</b>. Stays on the asset's own branch, and names a
 *       department only when that cannot be wrong.</li>
 * </ul>
 *
 * <h2>Head Office is the whole point</h2>
 * "Head Office" is one name covering 18 people across four departments, so it barely narrows
 * anything; "Finance" is an answer. Every other branch is one place and one team, and the branch name
 * is already the useful label — which is why both rules key on the Head Office flag rather than
 * preferring a department everywhere.
 *
 * <h2>The flag, and why it was not safe to key on until now</h2>
 * Both of these read `isHeadOffice`, and <b>two separate faults had to be fixed before that was
 * possible</b>:
 *
 * <ol>
 *   <li>Jackson published the entity flag as `headOffice` until it was pinned with `@JsonProperty`.</li>
 *   <li>`AssetService.buildAssetDao` rebuilds the asset's branch field by field and <b>left the flag
 *       out</b>, so `asset.branch.isHeadOffice` was `false` for every asset in the estate — including
 *       the ones at Head Office. The holder's branch was fine, because that one passes the real
 *       entity through.</li>
 * </ol>
 *
 * <p>Both produce the same silent failure: the rule matches nothing, everything falls through to the
 * branch name, and the feature looks implemented while doing nothing. That is why the predecessor of
 * `holderLocationLabel` compared `branch?.name === "Head Office"` — a **display name**, which Settings
 * can rename. It worked, and would have stopped working the day somebody made it
 * "Head Office - Kampala", with an empty column rather than an error.
 */

interface ILocated {
    name?: string;
    isHeadOffice?: boolean;
}

interface IHolder {
    branch?: ILocated | null;
    department?: { name?: string } | null;
}

/** An asset, as much of one as these helpers need. */
export interface IAssetOrigin {
    branch?: ILocated | null;
    assignedTo?: IHolder | null;
}

const trimmed = (value?: string | null): string | null => value?.trim() || null;

/**
 * Who has it — the register's "Location" column, and the shape the server's filter matches.
 *
 * <p>Falls back through the holder's department, the holder's branch, then the asset's own branch, so
 * an unassigned item still says where it is rather than nothing.
 *
 * <p><b>The fallback is the fix worth noticing.</b> The previous version returned `""` for a Head
 * Office holder with no department, leaving a blank cell that reads as data failing to load. Latent
 * rather than live — all 18 Head-Office-held assets currently have a department — but two Head Office
 * staff have none, so it was one assignment away.
 */
export const holderLocationLabel = (asset?: IAssetOrigin | null): string | null => {
    const holder = asset?.assignedTo;

    if (holder?.branch) {
        if (holder.branch.isHeadOffice) {
            return trimmed(holder.department?.name) ?? trimmed(holder.branch.name);
        }
        return trimmed(holder.branch.name);
    }

    return trimmed(asset?.branch?.name);
};

/**
 * Where it is — the detail page.
 *
 * <p>Stays on the asset's own branch, and substitutes the holder's department <b>only when the holder
 * is at Head Office too</b>. That condition is what keeps it honest: an asset on the Head Office
 * repair bench held by a Gulu officer reads "Head Office", which is true, rather than borrowing a
 * department from somebody who is not there.
 *
 * <p>Deliberately not the same answer as {@link holderLocationLabel}. The two can differ for an asset
 * away from its holder, and that difference is information — the detail page is the only screen that
 * says where an item physically is, so collapsing it into "who has it" would delete that fact rather
 * than reconcile it.
 */
export const assetLocationLabel = (asset?: IAssetOrigin | null): string | null => {
    const location = trimmed(asset?.branch?.name);

    if (asset?.branch?.isHeadOffice && asset.assignedTo?.branch?.isHeadOffice) {
        return trimmed(asset.assignedTo.department?.name) ?? location;
    }

    return location;
};

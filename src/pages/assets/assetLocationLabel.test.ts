/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { assetLocationLabel, holderLocationLabel } from './assetLocationLabel';

/**
 * The two location rules, and the cases that separate them.
 *
 * <p>Drawn from live data: 252 assets, 147 assigned and 105 unassigned; of the assigned, Gulu 115,
 * Head Office 18 (Business Technology 9, Finance 9) and Mbarara 14. Seven assets sit in maintenance
 * at Head Office, every one of them sent from Gulu — which is the case that shows why the register's
 * column and the detail page must not share one rule.
 */

const hq = { name: 'Head Office', isHeadOffice: true };
const gulu = { name: 'Gulu Branch', isHeadOffice: false };

const held = (branch: typeof hq, department?: string) => ({
    branch,
    department: department ? { name: department } : null,
});

describe('the register column — who has it', () => {
    it('names the department for a Head Office holder', () => {
        expect(holderLocationLabel({ branch: hq, assignedTo: held(hq, 'Finance') })).toBe('Finance');
    });

    it('names the branch for everyone else', () => {
        expect(holderLocationLabel({ branch: gulu, assignedTo: held(gulu) })).toBe('Gulu Branch');
    });

    /**
     * The `|| ""` this replaced left an empty cell, which reads as data failing to load.
     *
     * <p>Latent rather than live: all 18 Head-Office-held assets have a department today — but two
     * Head Office staff do not, so it was one assignment away.
     */
    it('falls back to the branch when a Head Office holder has no department', () => {
        expect(holderLocationLabel({ branch: hq, assignedTo: held(hq) })).toBe('Head Office');
    });

    /** 105 of 252 assets are unassigned, so this is the common path, not an edge case. */
    it('uses the asset own branch when nobody holds it', () => {
        expect(holderLocationLabel({ branch: gulu, assignedTo: null })).toBe('Gulu Branch');
        expect(holderLocationLabel({ branch: hq })).toBe('Head Office');
    });

    /** An asset follows its holder: on the Head Office bench, still Gulu's problem. */
    it('prefers the holder over where the asset physically sits', () => {
        expect(holderLocationLabel({ branch: hq, assignedTo: held(gulu) })).toBe('Gulu Branch');
    });
});

describe('the detail page — where it is', () => {
    it('names the department when the asset and its holder are both at Head Office', () => {
        expect(assetLocationLabel({ branch: hq, assignedTo: held(hq, 'Business Technology') }))
            .toBe('Business Technology');
    });

    /**
     * The case that stops the two rules being merged.
     *
     * <p>Seven assets are in maintenance at Head Office, all sent from Gulu. Borrowing the Gulu
     * holder's department would put a name on this asset belonging to somebody who is not where the
     * asset is — and the detail page is the only screen that says where an item physically is.
     */
    it('keeps Head Office when the holder is somewhere else', () => {
        expect(assetLocationLabel({ branch: hq, assignedTo: held(gulu, 'Operations') }))
            .toBe('Head Office');
    });

    it('keeps Head Office when nobody holds it', () => {
        expect(assetLocationLabel({ branch: hq, assignedTo: null })).toBe('Head Office');
    });

    it('leaves every other branch alone', () => {
        expect(assetLocationLabel({ branch: gulu, assignedTo: held(gulu) })).toBe('Gulu Branch');
    });
});

describe('the flag both rules depend on', () => {
    /**
     * Two separate faults had to be fixed before `isHeadOffice` could be trusted here, and both
     * failed the same way — silently, with everything falling through to the branch name:
     *
     * <ol>
     *   <li>Jackson published it as `headOffice` until `@JsonProperty` pinned it.</li>
     *   <li>`AssetService.buildAssetDao` rebuilt the asset's branch field by field and omitted it, so
     *       `asset.branch.isHeadOffice` was `false` for every asset in the estate.</li>
     * </ol>
     *
     * <p>This is what that regression looks like from here. It is also why the code these replaced
     * compared `branch.name === "Head Office"` — a display name Settings can rename.
     */
    it('treats a missing flag as not Head Office rather than guessing from the name', () => {
        const unflagged = { name: 'Head Office' };

        expect(holderLocationLabel({
            branch: unflagged,
            assignedTo: { branch: unflagged, department: { name: 'Finance' } },
        })).toBe('Head Office');

        expect(assetLocationLabel({
            branch: unflagged,
            assignedTo: { branch: unflagged, department: { name: 'Finance' } },
        })).toBe('Head Office');
    });
});

describe('an asset with nothing on record', () => {
    it('answers null rather than an empty string', () => {
        expect(holderLocationLabel(null)).toBeNull();
        expect(assetLocationLabel(undefined)).toBeNull();
        expect(holderLocationLabel({})).toBeNull();
        expect(assetLocationLabel({ branch: { name: '  ' } })).toBeNull();
    });
});

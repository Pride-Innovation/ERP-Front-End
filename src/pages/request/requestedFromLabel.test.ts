/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { requestedFromLabel } from './requestedFromLabel';

/**
 * The "Requested from" column's one rule.
 *
 * <p>Each case is drawn from live data rather than invented: 41 Gulu requests and 5 Mbarara, none
 * with a department; 14 Head Office requests across Business Technology (5), Finance (5),
 * Administration & Procurement (2) and **two with no department at all**.
 */

const hq = (department?: string) => ({
    branch: { name: 'Head Office', isHeadOffice: true },
    department: department ? { name: department } : null,
});

const branch = (name: string, department?: string) => ({
    branch: { name, isHeadOffice: false },
    department: department ? { name: department } : null,
});

describe('Head Office names the department', () => {
    it('shows the department rather than the building', () => {
        expect(requestedFromLabel(hq('Finance'))).toBe('Finance');
        expect(requestedFromLabel(hq('Business Technology'))).toBe('Business Technology');
    });

    /**
     * Two of the fourteen Head Office requests come from accounts with no department.
     *
     * <p>Without this the cell is empty, which reads as data failing to load rather than as a person
     * not being in a department — and "Head Office" is both true and what the column said before.
     */
    it('falls back to Head Office when the requester has no department', () => {
        expect(requestedFromLabel(hq())).toBe('Head Office');
        expect(requestedFromLabel({ ...hq(), department: { name: '   ' } })).toBe('Head Office');
    });
});

describe('every other branch is unchanged', () => {
    it('shows the branch name', () => {
        expect(requestedFromLabel(branch('Gulu Branch'))).toBe('Gulu Branch');
        expect(requestedFromLabel(branch('Mbarara'))).toBe('Mbarara');
    });

    /**
     * The reason the rule is keyed on `isHeadOffice` instead of being "department, else branch".
     *
     * <p>All 46 non-Head-Office requests currently have no department, so the two forms are
     * indistinguishable on today's data — and the simpler one would start rewriting the Gulu rows the
     * day somebody assigns a branch officer a department. This is the case that would have caught it.
     */
    it('ignores a department on a branch requester', () => {
        expect(requestedFromLabel(branch('Gulu Branch', 'Finance'))).toBe('Gulu Branch');
    });
});

describe('the flag this depends on', () => {
    /**
     * `isHeadOffice` was published as `headOffice` until it was pinned with `@JsonProperty`, because
     * Lombok names a primitive boolean's getter `isHeadOffice()` and Jackson strips the prefix. Read
     * under the Java name it was permanently `undefined`.
     *
     * <p>This asserts what that regression would look like here: every Head Office row quietly
     * falling through to the branch name, with the feature appearing implemented and doing nothing.
     */
    it('treats a missing isHeadOffice as not Head Office', () => {
        const unpinned = { branch: { name: 'Head Office' }, department: { name: 'Finance' } };

        expect(requestedFromLabel(unpinned))
            .toBe('Head Office');
    });
});

describe('a requester with nothing on record', () => {
    it('answers null rather than an invented string', () => {
        expect(requestedFromLabel(null)).toBeNull();
        expect(requestedFromLabel(undefined)).toBeNull();
        expect(requestedFromLabel({})).toBeNull();
        expect(requestedFromLabel({ branch: { name: '  ', isHeadOffice: true } })).toBeNull();
    });
});

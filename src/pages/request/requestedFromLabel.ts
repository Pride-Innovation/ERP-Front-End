/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * The minimum a requester needs for this to answer.
 *
 * <p>Structural rather than `IUser`, for the same reason {@link IHasApprover} is: the export path
 * maps a raw API response rather than a typed row, and widening that to the full user interface — or
 * casting at the call site — would be the worse trade.
 */
export interface IHasOrigin {
    branch?: { name?: string; isHeadOffice?: boolean } | null;
    department?: { name?: string } | null;
}

/**
 * Where a request came from, as a reader of the register would name it.
 *
 * <h2>The rule</h2>
 * <ul>
 *   <li><b>Head Office</b> → the requester's <em>department</em>. "Head Office" is 18 people across
 *       four departments, so naming the building says almost nothing; "Finance" says who wants it.</li>
 *   <li><b>Anywhere else</b> → the branch name, unchanged. A branch is one place and one team, and
 *       that is already the useful answer.</li>
 * </ul>
 *
 * <h2>Why the rule is conditional rather than "department, else branch"</h2>
 * The unconditional form reads more simply and is the wrong rule. Measured on live data, <b>all 46
 * non-Head-Office requests have no department recorded</b>, so the two behave identically today — and
 * would diverge silently on the day somebody assigns a branch officer a department, quietly changing
 * what the Gulu and Mbarara rows say. Keying on {@code isHeadOffice} means the column only ever
 * changes for the branch the change was asked for.
 *
 * <h2>Head Office with no department reads "Head Office"</h2>
 * Two of the fourteen Head Office requests come from accounts with no department on record. Without a
 * fallback those cells are empty, which reads as data failing to load rather than as a person not
 * being in a department. "Head Office" is true, and it is what the column said before this change.
 *
 * <p>Deliberately <b>not</b> "Head Office — no department": that flags an administrative gap in a
 * column people read for orientation, on every affected row. The gap is real and belongs on the user
 * record, not in this register.
 *
 * <h2>One rule, three call sites</h2>
 * The list rows, the single-request shape and the export's own mapper all build this field, and the
 * export refetches from the API rather than reusing the table's rows — so leaving them separate is
 * how the screen and the downloaded file come to disagree. This is the same fault
 * {@code requestApproverLabel} was extracted to end, where seven places had built one string by hand.
 *
 * <h2>It depends on a wire name that was wrong until recently</h2>
 * {@code isHeadOffice} is a primitive `boolean` on the Java entity, so Lombok's getter is
 * {@code isHeadOffice()} and Jackson published it as <b>{@code headOffice}</b> until it was pinned
 * with {@code @JsonProperty}. Read under the Java name it was permanently `undefined` — so this rule
 * would have matched nothing, every Head Office row would have fallen through to the branch name, and
 * the feature would have looked implemented while doing nothing. `BooleanWireNameTest` pins the name;
 * if it ever goes, this goes silently with it.
 *
 * @returns the department or branch name, or `null` when the requester has neither — a row with
 *          nothing to say, rather than a row asserting something untrue
 */
export const requestedFromLabel = (requester?: IHasOrigin | null): string | null => {
    const branch = requester?.branch?.name?.trim() || null;

    if (requester?.branch?.isHeadOffice) {
        const department = requester.department?.name?.trim() || null;
        return department ?? branch;
    }

    return branch;
};

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * The minimum a record needs for these helpers to answer.
 *
 * <p>Structural rather than `IRequest` because the action modals carry a deliberately narrow local
 * shape, and widening them to the full interface — or casting at the call site — would be a worse
 * trade than naming what is actually required.
 */
export interface IHasApprover {
    currentApprover?: { firstName?: string; lastName?: string } | null;
    currentUnit?: { id?: string | number | null; name?: string } | null;
}

/**
 * Who a request is currently with — a person, or the unit whose turn it is.
 *
 * <h2>Why "Unassigned" was wrong rather than merely unhelpful</h2>
 * A workflow step can be routed to a **unit** instead of an individual: an acknowledgement goes to
 * Admin or to Infra depending on the asset's category, and such a step sets {@code currentUnit} with
 * no {@code currentApprover} at all. Every screen read only the person, so a request genuinely
 * sitting with Admin displayed as *"Unassigned"* / *"Not specified"* / *"Not yet assigned to an
 * approver"* — three different phrasings of the same wrong answer.
 *
 * <p>It is wrong because the request **is** assigned; it is with a unit, and somebody in that unit
 * has to act. Saying nobody has it invites the reader to conclude the workflow has stalled, which is
 * the opposite of the truth, and gives them nowhere to chase.
 *
 * <p>Seven places built this string by hand from {@code firstName + lastName}, and none of them could
 * have got the unit right. They now share this, so a routing rule added later lands everywhere at
 * once.
 *
 * <h2>Deliberately not merged with `personName`</h2>
 * That helper also renders the *requester*, where a unit is never the answer. Widening it would put a
 * unit fallback on a field that should stay a person — and it is already declared three times across
 * the dashboard and the request pages, each having drifted slightly, which is its own tidy-up.
 *
 * @returns the person's name, else the unit's name, else `null` for a request genuinely with nobody —
 *          finished, rejected, or awaiting a step whose approver did not resolve
 */
export const requestApproverLabel = (request?: IHasApprover | null): string | null => {
    const person = request?.currentApprover;
    if (person) {
        const name = `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim();
        if (name) return name;
    }

    const unit = request?.currentUnit?.name?.trim();
    return unit || null;
};

/**
 * Whether the label above names a unit rather than a person.
 *
 * <p>Lets a caller phrase it correctly — "Waiting on Admin Unit" reads naturally, while a screen that
 * wants to say "assigned to" may prefer "with" for a group. Nothing is forced to use it.
 */
export const isUnitApprover = (request?: IHasApprover | null): boolean =>
    !request?.currentApprover && Boolean(request?.currentUnit?.name?.trim());

/**
 * The same answer for a screen that must print something.
 *
 * <p>Kept beside the nullable form so the fallback wording is decided once rather than invented at
 * each call site — which is how "Unassigned", "Not specified" and "Not yet assigned to an approver"
 * came to describe the same state in three different words.
 */
export const requestApproverLabelOr = (
    request: IHasApprover | null | undefined,
    fallback: string,
): string => requestApproverLabel(request) ?? fallback;

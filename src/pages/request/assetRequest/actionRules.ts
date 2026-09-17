/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { PERMISSIONS, PermissionName } from '../../../core/permissions/constants';
import { ISSUED_REQUEST_CODES, PENDING_REQUEST_CODES } from '../../../utils/constants';
import { IRequest } from '../interface';

/**
 * Who may edit, approve or reject a request — one definition, shared by the list and the
 * detail page.
 *
 * These used to be written out separately in each place and had drifted apart: the list showed
 * "Approve Request" to anyone holding APPROVE_REQUEST regardless of whose turn it was, while the
 * detail page also allowed it when the request had no designated approver at all — and the
 * approval payload has no id to send in that case, so the call 500s. Keeping the rules here means
 * a fix lands in both views at once.
 */

/**
 * Codes at which an approve/reject decision is still meaningful: freshly created, or partway
 * through the approval chain.
 *
 * Deliberately an allow-list. The previous deny-list of "terminal" codes had to enumerate every
 * end state and had already missed `issuanceApproved`, so a request past issuance approval still
 * offered Approve and Reject. Deriving from the same PENDING_REQUEST_CODES the listing tabs use
 * means a new workflow stage is picked up here automatically.
 */
export const APPROVABLE_REQUEST_CODES: ReadonlyArray<string> = [
    'requestCreated',
    ...PENDING_REQUEST_CODES,
];

/**
 * Codes at which the requester may still change the request.
 *
 * `requestRejected` is included on purpose — a rejection sends the request back to its owner to
 * correct and resubmit, which is the whole point of the rejection comment.
 */
export const EDITABLE_REQUEST_CODES: ReadonlyArray<string> = [
    'requestCreated',
    'requestRejected',
];

/** The signed-in user, as far as these rules are concerned. */
export interface IRequestActor {
    id?: string | number | null;
    /**
     * The unit the actor belongs to, if any.
     *
     * <p>Needed because a workflow step can be routed to a <em>unit</em> rather than to a named
     * person — a group-email step sets {@code currentUnit} and often no {@code currentApprover} at
     * all. Without this the page cannot tell that the step is the actor's to take.
     */
    unitId?: string | number | null;
    has: (name: PermissionName | string) => boolean;
}

/** Ids arrive as number from the API and string from session storage, so compare as strings. */
const sameId = (a?: string | number | null, b?: string | number | null): boolean =>
    a !== null && a !== undefined && b !== null && b !== undefined && String(a) === String(b);

export const isRequester = (request: IRequest, actor: IRequestActor): boolean =>
    sameId(request?.requester?.id, actor.id);

export const isDesignatedApprover = (request: IRequest, actor: IRequestActor): boolean =>
    sameId(request?.currentApprover?.id, actor.id);

/**
 * Whether the workflow has routed this step to the actor at all.
 *
 * <h2>Mirrors WorkflowEngineService.requireActorIsRouted, limb for limb</h2>
 * The engine admits three kinds of actor: the named {@code currentApprover}, a member of the
 * {@code currentUnit} a group step was routed to, and a holder of {@code MANAGE_ALL_BRANCH_REQUESTS}
 * acting as an override. This checked only the first.
 *
 * <p>The consequence was a dead end rather than an error, which is why it survived: the listing's
 * inbox predicate already matches on {@code currentUnit}, so a unit-routed request <b>appeared in the
 * user's "awaiting me" list and then offered no Approve button</b>. Nothing failed; the work simply
 * could not be actioned, and there was nothing on screen to say why.
 *
 * <p>If these two ever drift again, the page either offers a control the server refuses or hides one
 * the user is entitled to — and the second is the harder to notice.
 */
export const isRoutedToActor = (request: IRequest, actor: IRequestActor): boolean =>
    isDesignatedApprover(request, actor)
    || sameId(request?.currentUnit?.id, actor.unitId)
    || actor.has(PERMISSIONS.MANAGE_ALL_BRANCH_REQUESTS);

const isAwaitingDecision = (request: IRequest): boolean =>
    APPROVABLE_REQUEST_CODES.includes(request?.status?.status ?? '');

/**
 * The kind of action the workflow is currently waiting for.
 *
 * <h2>Driven by the step, not by the status</h2>
 * `ApprovalStep.stepType` already names exactly these four stages, and every one of them goes
 * through `WorkflowEngineService.processStepAction`. Mapping request *statuses* to actions instead
 * would be guesswork twice over: there are a dozen of them, and for the acknowledgement and issuance
 * steps the **client** sends the target status id (`findOneStatus(dto.getStatusId())`), so the status
 * is a consequence of the action rather than a description of what is due.
 *
 * <p>The current step is the one log still `PENDING`. Nothing new is fetched for this — the detail
 * page already loads the trail to decide whether the approval certificate can be printed.
 *
 * @returns the pending step's type, or `null` when nothing is pending — which includes a finished
 *          request and a legacy one with no workflow instance at all
 */
export const currentStepType = (request?: IRequest | null): string | null =>
    request?.currentStepType ?? null;

/**
 * Approving requires the permission, that it is this user's turn, and that the turn is an
 * *approval* turn.
 *
 * <h2>The step is the authority here, not the status</h2>
 * These were gated on status alone while the later actions were gated on the workflow step, so the
 * two disagreed the moment they diverged — which is routine. `unitAcknowledged` lives in
 * `WORKFLOW_APPROVAL_CODES`, so a request sitting at the **ISSUANCE** step still read as "awaiting a
 * decision" and offered Approve and Reject beside Issue Items. The user could not tell which of the
 * three was the right thing to press.
 *
 * <p>That was not merely confusing. `WorkflowEngineService.processStepAction` resolves whatever step
 * is *current* and applies the action it is handed, without checking the two suit each other — so
 * pressing Approve there would have marked the **issuance** step approved and advanced the workflow,
 * recording the request as issued when nothing had been. The engine now refuses that as well; this
 * is the half that stops it being offered.
 *
 * <p>The status check stays as the second condition: it still distinguishes a rejected request, and
 * two agreeing conditions are cheaper than working out which one is redundant.
 *
 * <p>Note what this also fixes about the override. `isRoutedToActor` admits
 * `MANAGE_ALL_BRANCH_REQUESTS`, which answers *"may I act on another branch's requests"* — it was
 * being read as *"is it my turn"*, so a holder saw Approve at every stage. Requiring the step
 * separates the two axes again: the override widens which branches, never which stage.
 */
export const canApproveRequest = (request: IRequest, actor: IRequestActor): boolean =>
    actor.has(PERMISSIONS.APPROVE_REQUEST) &&
    currentStepType(request) === 'REQUEST_APPROVAL' &&
    isRoutedToActor(request, actor) &&
    isAwaitingDecision(request);

/**
 * Rejecting belongs to both approval stages.
 *
 * <p>The ladder's tiers are the obvious one. The issuance sign-off is the other: the engine's
 * `handleRejection` is indifferent to which step it runs at, and the issuer's manager refusing an
 * issuance is exactly what that step is for. Requiring `isAwaitingDecision` there would have hidden
 * it — a request at the issuance approval carries `issued`, which is not an approvable code — and a
 * stage with no way to say no strands the request.
 */
export const canRejectRequest = (request: IRequest, actor: IRequestActor): boolean =>
    actor.has(PERMISSIONS.REJECT_REQUEST) &&
    isRoutedToActor(request, actor) &&
    ((currentStepType(request) === 'REQUEST_APPROVAL' && isAwaitingDecision(request))
        || currentStepType(request) === 'ISSUANCE_APPROVAL');

/** Editing is the requester's own privilege, and only before the request has moved on. */
export const canEditRequest = (request: IRequest, actor: IRequestActor): boolean =>
    actor.has(PERMISSIONS.UPDATE_REQUEST) &&
    isRequester(request, actor) &&
    EDITABLE_REQUEST_CODES.includes(request?.status?.status ?? '');

/* ── The rest of the lifecycle ────────────────────────────────────────────────────────────────
 *
 * A request does not end at approval. After the last tier it is acknowledged by Infra or Admin
 * (whichever the asset's category routes to), then issued by Admin, then the issuance is approved,
 * and finally the requester acknowledges receipt of what arrived.
 *
 * The detail page offered only Approve, Reject and Edit, so whoever's turn it was at any of those
 * four later stages opened the request, read it, and found nothing to do — they had to go back to
 * the list and use a row menu. That is backwards: the detail page is where you read a request
 * before acting on it.
 */


/**
 * Every later action asks the same two questions, and both have to hold.
 *
 * <p><b>Is the workflow waiting for this kind of action?</b> — from the step, so a workflow
 * reconfigured in Settings is followed automatically rather than needing this file edited.
 *
 * <p><b>Is it routed to me?</b> — `isRoutedToActor`, the same limb-for-limb mirror of
 * `requireActorIsRouted` that Approve and Reject use. Deliberately *only* routing: for
 * `ACKNOWLEDGE_RECEIPT` it is tempting to add "or I am the requester", since that is who the step is
 * for, but the engine will refuse anyone it did not route to. Offering a button on a guess is the
 * failure this mirroring exists to prevent.
 *
 * <p><b>No pending step means no actions.</b> A legacy request predating the workflow engine has no
 * instance, so `hasActiveInstance` is false and the engine takes its permissive path. The page still
 * shows nothing: without a workflow there is no way to know which stage the request is at, and a
 * wrongly-offered button on a real request is worse than sending someone to the list.
 */
const stepAwaits = (
    request: IRequest,
    actor: IRequestActor,
    stepType: string,
): boolean => currentStepType(request) === stepType && isRoutedToActor(request, actor);

/** Infra or Admin confirming they have the request — the handshake before issuance begins. */
export const canAcknowledgeRequest = (request: IRequest, actor: IRequestActor): boolean =>
    actor.has(PERMISSIONS.ACKNOWLEDGE_REQUEST) &&
    stepAwaits(request, actor, 'ACKNOWLEDGE_REQUEST');

/**
 * Handing the items over. The first of the two acts inside the ISSUANCE step.
 *
 * <p>Hidden once the request has actually been issued, because `IssuanceApprovalRecordService` loads
 * an existing `Issuance` — so the order is issue *then* approve, and offering both at once would
 * invite the second before the first is possible.
 */
export const canIssueItems = (request: IRequest, actor: IRequestActor): boolean =>
    actor.has(PERMISSIONS.ISSUE_ITEMS) &&
    !ISSUED_REQUEST_CODES.includes(request?.status?.status ?? '') &&
    stepAwaits(request, actor, 'ISSUANCE');

/**
 * Signing off what was issued.
 *
 * <h2>Not the ISSUANCE step — a stage of its own, and measuring found it</h2>
 * This first required the `ISSUANCE` step, on the reasoning that issuing and approving the issuance
 * are two acts inside it. They are not. Issuing calls `processStepAction`, which **advances the
 * workflow**: the sign-off is the *next* step, stored as a `REQUEST_APPROVAL` whose
 * `approverSubject` is `ISSUER` and routed to the issuer's manager. So the condition could never
 * hold, and on live data it never did — every issued request had already moved past `ISSUANCE`, and
 * *Approve Issuance* was offered nowhere.
 *
 * <p>Its neighbour was the worse half. That step reads as a plain `REQUEST_APPROVAL`, so
 * `canApproveRequest` would have offered **Approve Request** on a request already issued — and the
 * two post to different endpoints. `POST /approvals` only advances the step; `POST /approve-issuance`
 * creates the fulfilment movement that actually sends the items. Approving it as a request would
 * have recorded the issuance approved with nothing on its way to the requester.
 *
 * <p>The backend now names the stage `ISSUANCE_APPROVAL`, so both rules read the same field and
 * neither can claim the other's step.
 */
export const canApproveIssuance = (request: IRequest, actor: IRequestActor): boolean =>
    actor.has(PERMISSIONS.APPROVE_ISSUANCE) &&
    ISSUED_REQUEST_CODES.includes(request?.status?.status ?? '') &&
    request?.status?.status !== 'receiptAcknowledged' &&
    stepAwaits(request, actor, 'ISSUANCE_APPROVAL');

/** The requester confirming what actually arrived — the last thing that happens to a request. */
export const canAcknowledgeReceipt = (request: IRequest, actor: IRequestActor): boolean =>
    actor.has(PERMISSIONS.ACKNOWLEDGE_REQUEST) &&
    stepAwaits(request, actor, 'ACKNOWLEDGE_RECEIPT');

/* ── One answer for both surfaces ─────────────────────────────────────────────────────────────── */

/**
 * Every action this user may take on this request, right now.
 *
 * <h2>Why this exists</h2>
 * The row menu and the detail page were deciding this separately, and the menu was the looser of the
 * two. `TableUtills.resolveStateOptions` narrowed by `(tab, row status, is the viewer the requester)`
 * across **575 lines of exclusions** — thirteen of them saying "not approve" — and it never asked
 * whose turn it was. Any holder of `APPROVE_REQUEST` was offered *Approve Request* on **every** row,
 * including requests routed to somebody else at another tier; the engine refused the click, but the
 * menu had promised it.
 *
 * <p>It also never asked what stage the request was at. The whole Pending tab shared one branch that
 * ignored the row, so a request already at the issuance step still offered Approve — the same fault
 * the detail page had, and the one that would have advanced the wrong step.
 *
 * <p>And it failed **open**: when no branch matched, the default stripped only delete, update and
 * Approve Issuance and returned everything else. A status nobody had written a branch for showed
 * Approve, Reject and Issue Items, silently.
 *
 * <p>Adding branches could not fix that shape. This asks the same questions the detail page asks, in
 * the same order, from the same rules — so the two cannot drift, and a new stage is picked up by both
 * at once.
 *
 * @param actions the action names this surface knows how to render, so a menu is never told to show
 *                something it has no handler for
 */
export const availableRequestActions = (
    request: IRequest,
    actor: IRequestActor,
    actions: {
        read: string; update: string; delete: string;
        approve: string; reject: string; issue: string;
        acknowledgeRequest: string; acknowledgeReceipt: string; approveIssuance: string;
    },
): Set<string> => {
    const allowed = new Set<string>();

    // Opening a record you can already see in the listing is not a privilege — the listing is
    // scoped, and the detail endpoint checks again on its own.
    allowed.add(actions.read);

    if (canEditRequest(request, actor)) allowed.add(actions.update);
    if (canApproveRequest(request, actor)) allowed.add(actions.approve);
    if (canRejectRequest(request, actor)) allowed.add(actions.reject);
    if (canAcknowledgeRequest(request, actor)) allowed.add(actions.acknowledgeRequest);
    if (canIssueItems(request, actor)) allowed.add(actions.issue);
    if (canApproveIssuance(request, actor)) allowed.add(actions.approveIssuance);
    if (canAcknowledgeReceipt(request, actor)) allowed.add(actions.acknowledgeReceipt);

    /*
     * Deleting is the requester's, at the same point editing is.
     *
     * The old menu offered Delete to any holder of DELETE_REQUEST on rows that were not theirs and
     * had already moved through approvals. The backend refuses that now — `requireRequestChangeable`
     * keys on the requester's branch — so the menu was promising a 403.
     */
    if (actor.has(PERMISSIONS.DELETE_REQUEST)
        && isRequester(request, actor)
        && EDITABLE_REQUEST_CODES.includes(request?.status?.status ?? '')) {
        allowed.add(actions.delete);
    }

    return allowed;
};

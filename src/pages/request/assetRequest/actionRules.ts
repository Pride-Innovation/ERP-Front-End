/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { PERMISSIONS, PermissionName } from '../../../core/permissions/constants';
import { PENDING_REQUEST_CODES } from '../../../utils/constants';
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
    has: (name: PermissionName | string) => boolean;
}

/** Ids arrive as number from the API and string from session storage, so compare as strings. */
const sameId = (a?: string | number | null, b?: string | number | null): boolean =>
    a !== null && a !== undefined && b !== null && b !== undefined && String(a) === String(b);

export const isRequester = (request: IRequest, actor: IRequestActor): boolean =>
    sameId(request?.requester?.id, actor.id);

export const isDesignatedApprover = (request: IRequest, actor: IRequestActor): boolean =>
    sameId(request?.currentApprover?.id, actor.id);

const isAwaitingDecision = (request: IRequest): boolean =>
    APPROVABLE_REQUEST_CODES.includes(request?.status?.status ?? '');

/**
 * Approving requires the permission *and* that it is actually this user's turn.
 *
 * The "no designated approver" escape hatch is gone: `currentApprover` is what the approval
 * payload identifies the actor by, so acting without one cannot succeed. A request that reaches
 * this state has lost its workflow routing and needs fixing upstream, not a button that fails.
 */
export const canApproveRequest = (request: IRequest, actor: IRequestActor): boolean =>
    actor.has(PERMISSIONS.APPROVE_REQUEST) &&
    isDesignatedApprover(request, actor) &&
    isAwaitingDecision(request);

export const canRejectRequest = (request: IRequest, actor: IRequestActor): boolean =>
    actor.has(PERMISSIONS.REJECT_REQUEST) &&
    isDesignatedApprover(request, actor) &&
    isAwaitingDecision(request);

/** Editing is the requester's own privilege, and only before the request has moved on. */
export const canEditRequest = (request: IRequest, actor: IRequestActor): boolean =>
    actor.has(PERMISSIONS.UPDATE_REQUEST) &&
    isRequester(request, actor) &&
    EDITABLE_REQUEST_CODES.includes(request?.status?.status ?? '');

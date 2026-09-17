/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IOptions } from '../../../components/tables/interface';
import { crudStates } from '../../../utils/constants';
import { IRequest } from '../interface';
import { IRequestActor, availableRequestActions } from './actionRules';

/**
 * Stamped on every asset-request row, and the only thing that selects these rules.
 *
 * <h2>Why not the module name</h2>
 * The obvious key was the tab's `module` — 'request', 'pending requests', 'issued requests',
 * 'rejected requests'. **`transportRequest/utills.tsx` also calls itself `"request"`.** Fleet
 * requisitions are a different entity with a different endpoint and a status column holding status
 * *names*, not request codes, so keying on the module would have run these rules over them and
 * removed Update and Delete from that page entirely — a menu emptied by a name collision.
 *
 * <p>The row is the honest key: these rules apply exactly when the record is an asset request,
 * whatever the tab that lists it is called. A fifth tab needs no registration, and a page that is
 * not a request cannot be caught by accident.
 */
export const REQUEST_ROW_KIND = 'assetRequest';

/** Whether these rules govern this row at all. */
export const isRequestRow = (row: any): boolean => row?.rowKind === REQUEST_ROW_KIND;

/**
 * The row menu's action names, mapped to the vocabulary `actionRules` speaks.
 *
 * <p>Passed explicitly rather than assumed, so the rules cannot name an action this menu has no
 * handler for — `handleOptionClicked` switches on exactly these.
 */
const ROW_ACTIONS = {
    read: crudStates.read,
    update: crudStates.update,
    delete: crudStates.delete,
    approve: crudStates.approve,
    reject: crudStates.reject,
    issue: crudStates.issue,
    acknowledgeRequest: crudStates.acknowledgeRequest,
    acknowledgeReceipt: crudStates.acknowledgeReceipt,
    approveIssuance: crudStates.approveIssuance,
};

/**
 * A table row, read back as the request the rules expect.
 *
 * <p>The rules are written against `IRequest` because the detail page holds the whole record. A row
 * holds a flattened copy of the same facts, so this puts them back rather than giving the rules a
 * second shape to understand — one rule, one input, and no way for the two surfaces to answer
 * differently.
 *
 * <p>Only the fields the rules read are reconstructed. `status` arrives as the bare code because
 * that is what the column renders.
 */
const requestFromRow = (row: any): IRequest => ({
    id: row?.id,
    requester: { id: row?.requesterID },
    currentApprover: row?.currentApproverId ? { id: row.currentApproverId } : null,
    currentUnit: row?.currentUnitId ? { id: row.currentUnitId } : null,
    currentStepType: row?.currentStepType ?? null,
    status: { status: row?.status },
} as unknown as IRequest);

/**
 * The row menu for a request, decided by the same rules as the detail page's buttons.
 *
 * <h2>What this replaces</h2>
 * `TableUtills.resolveStateOptions` narrowed the menu by `(tab, row status, am I the requester)`
 * across some 250 lines of exclusion lists. Three things were wrong with that shape, and none of
 * them could be fixed by adding another branch:
 *
 * <ul>
 *   <li><b>It never asked whose turn it was.</b> Any holder of `APPROVE_REQUEST` was offered
 *       *Approve Request* on every pending row, including requests routed to another person at
 *       another tier. The engine refuses the click — `requireActorIsRouted` — so the menu was
 *       promising a refusal.</li>
 *   <li><b>It never asked what stage the request was at.</b> The whole Pending tab shared one
 *       branch that ignored the row entirely, so a request already at the issuance step still
 *       offered Approve. That is the fault that would have advanced the wrong step.</li>
 *   <li><b>It failed open.</b> When no branch matched — and the Rejected tab matched none at all —
 *       the default stripped delete, update and Approve Issuance and returned everything else.</li>
 * </ul>
 *
 * <p>The tab is deliberately not consulted. Which list a request is being viewed in says nothing
 * about what may be done to it; the request's own stage and the viewer's relationship to it say
 * everything, and they are what the endpoints check.
 *
 * <h2>What a viewer loses</h2>
 * Somebody the workflow has not routed the request to now sees **View Details** alone, on every
 * tab. That is what the detail page already showed them, and what the endpoints already enforced.
 */
export const filterRequestRowOptions = (
    options: IOptions[],
    row: any,
    actor: IRequestActor,
): IOptions[] => {
    const allowed = availableRequestActions(requestFromRow(row), actor, ROW_ACTIONS);
    return (options ?? []).filter((option) => allowed.has(String(option?.value)));
};

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IRequest } from '../../interface';

/**
 * One entry in a request's workflow step log, as returned by `/workflow/step-logs/{requestId}`.
 *
 * `approverType` and `stepType` are the enum names from the workflow definition, resolved
 * server-side at read time. `stepName` is free text an administrator can edit in Settings, so it
 * is for display only — never branch on it.
 */
export interface IStepLog {
    id: number;
    stepOrder: number;
    stepName: string;
    approverType: string | null;
    stepType: string | null;
    action: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ISSUED' | 'ACKNOWLEDGED' | 'SUPERSEDED';
    comment: string | null;
    actorId: number | null;
    actorName: string | null;
    actorEmail: string | null;
    createDate: string;
    lastModified: string;
}

/** The approver type that authorises printing, per office. */
const SIGN_OFF_TYPE = {
    headOffice: 'DEPT_HEAD',
    branch: 'BRANCH_MANAGER',
} as const;

/**
 * Whether the requester sits at Head Office.
 *
 * Checks both spellings on purpose: the entity field is `isHeadOffice`, but Jackson derives the
 * JSON property from the `isHeadOffice()` getter and publishes it as `headOffice`. Which one
 * arrives depends on the serialiser's naming, and reading only one has silently mis-scoped
 * requests before — see the same defensive pair in `panels/WorkflowRoutesPanel`.
 */
export const isHeadOfficeRequest = (request: IRequest): boolean => {
    const branch = request?.requester?.branch as
        | { isHeadOffice?: boolean; headOffice?: boolean }
        | null
        | undefined;
    return Boolean(branch?.headOffice ?? branch?.isHeadOffice);
};

export interface IPrintEligibility {
    /** True when the authorising approval has been recorded. */
    allowed: boolean;
    /** Who must sign off for this request — shown in the disabled tooltip. */
    requiredRole: string;
    /** Plain-language reason, for the tooltip when `allowed` is false. */
    reason: string;
}

/**
 * Whether the approval certificate may be printed yet.
 *
 * The rule is the bank's: a branch request needs its Branch Manager's approval, a Head Office
 * request needs its Head of Department's. Anything earlier is still moving through the chain and
 * a printed certificate would misrepresent it as settled.
 *
 * Decided from the step log rather than from the request's current status, because status is a
 * single value that keeps moving — once a request is issued it no longer reads
 * `branchManagerApproved`, and gating on the current value would make the document printable for
 * a window and then not. The log is append-only, so "did this office sign off" stays answerable
 * for the life of the request.
 */
export const printEligibility = (
    request: IRequest,
    logs: IStepLog[],
    logsLoaded: boolean,
): IPrintEligibility => {
    const headOffice = isHeadOfficeRequest(request);
    const requiredType = headOffice ? SIGN_OFF_TYPE.headOffice : SIGN_OFF_TYPE.branch;
    const requiredRole = headOffice ? 'Head of Department' : 'Branch Manager';

    if (!logsLoaded) {
        return { allowed: false, requiredRole, reason: 'Loading the approval trail…' };
    }

    if (logs.length === 0) {
        return {
            allowed: false,
            requiredRole,
            // Requests raised before the workflow engine was deployed have no instance and so no
            // log. There is no way to show that the required approval happened, so the document is
            // withheld rather than printed on an assumption.
            reason: 'No approval trail was recorded for this request, so its sign-off cannot be verified.',
        };
    }

    const signedOff = logs.some(
        (log) => log.action === 'APPROVED' && log.approverType === requiredType,
    );

    if (signedOff) {
        return { allowed: true, requiredRole, reason: '' };
    }

    const rejected = logs.some((log) => log.action === 'REJECTED');
    return {
        allowed: false,
        requiredRole,
        reason: rejected
            ? 'This request was rejected, so there is no approval to certify.'
            : `Available once the ${requiredRole} has approved this request.`,
    };
};

/**
 * The decided steps, in the order they happened.
 *
 * PENDING steps are dropped — the certificate records decisions taken, not ones outstanding.
 * SUPERSEDED steps are dropped too: those are entries that were still pending when a rejected
 * request was resubmitted, so printing them would show approvals that never happened.
 */
export const decidedSteps = (logs: IStepLog[]): IStepLog[] =>
    logs
        .filter((log) => log.action !== 'PENDING' && log.action !== 'SUPERSEDED')
        .sort((a, b) => {
            if (a.stepOrder !== b.stepOrder) return a.stepOrder - b.stepOrder;
            return new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
        });

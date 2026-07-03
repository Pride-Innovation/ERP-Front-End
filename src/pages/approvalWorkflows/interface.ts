/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IAxiosResponse } from "../../core/apis/interface";

export type StepType =
    | 'ACKNOWLEDGE_REQUEST'
    | 'REQUEST_APPROVAL'
    | 'ISSUANCE'
    | 'ACKNOWLEDGE_RECEIPT';

export type ApproverType =
    | 'DIRECT_SUPERVISOR'
    | 'SUPERVISOR'
    | 'MANAGER'
    | 'DEPT_HEAD'
    | 'BOM'
    | 'BRANCH_MANAGER'
    | 'ADMIN'
    | 'GROUP_EMAIL'
    | 'SPECIFIC_USER'
    | 'REQUESTER';

export type BranchScope = 'ALL' | 'HEAD_OFFICE' | 'BRANCH';

/**
 * Whose reporting line a role-based approver type climbs.
 * - REQUESTER: the requester's chain (default).
 * - ISSUER: the chain of the person who issued the items — e.g. issuance approval by the issuer's manager.
 */
export type ApproverSubject = 'REQUESTER' | 'ISSUER';

/**
 * How a step's CC / notify group is resolved at send time.
 * - STATIC: use the literal `notifyGroupEmail` typed on the form.
 * - REQUESTER_MANAGERS_GROUP: dynamic — picks the requester's department managers group (Head Office)
 *   or branch managers group (other branches). One workflow then works across all departments / branches.
 * - NONE: do not CC anyone.
 */
export type NotifyGroupSource =
    | 'STATIC'
    | 'REQUESTER_MANAGERS_GROUP'
    | 'REQUESTER'
    | 'REQUESTER_DIRECT_SUPERVISOR'
    | 'ADMIN'
    | 'NONE';

export interface IApprovalStep {
    id?: number;
    stepOrder: number;
    stepName: string;
    stepType: StepType;
    approverType: ApproverType;
    /** Whose reporting line a role-based approver type climbs (requester by default, or the issuer). */
    approverSubject?: ApproverSubject;
    /** Selected fulfilment unit for a GROUP_EMAIL step (preferred over groupEmail; resolves routing by unit, not by matching an email string). */
    unitId?: number | null;
    /** Display name of the selected unit (response only). */
    unitName?: string | null;
    groupEmail: string;
    specificUserId: string;
    notifyGroupEmail: string;
    notifyGroupSource: NotifyGroupSource;
    /** Recipients to email when this step is completed. STATIC and NONE entries are ignored. */
    notifyOnCompletion: NotifyGroupSource[];
    optional: boolean;
    escalationHours: number;
    /** If the requester has any of these role ids, this step is skipped (e.g. skip "Direct Supervisor" when a manager raises the request). */
    skipIfRequesterRoleIds?: number[];
}

export interface IApprovalWorkflow {
    id?: number;
    name: string;
    description: string;
    assetTypeIds: number[];
    assetTypeNames?: string[];
    branchId: number | null;
    branchName?: string;
    branchScope: BranchScope;
    active: boolean;
    priority: number;
    /** Workflow only matches when the requester has at least one of these role ids. Empty = applies to all roles. */
    requesterRoleIds?: number[];
    requesterRoleNames?: string[];
    steps: IApprovalStep[];
}

export const STEP_TYPE_LABELS: Record<StepType, string> = {
    ACKNOWLEDGE_REQUEST: 'Acknowledge Request',
    REQUEST_APPROVAL:    'Approve Request',
    ISSUANCE:            'Issue Asset',
    ACKNOWLEDGE_RECEIPT: 'Acknowledge Receipt',
};

export const APPROVER_TYPE_LABELS: Record<ApproverType, string> = {
    DIRECT_SUPERVISOR: 'Direct Supervisor',
    SUPERVISOR:        'Supervisor (auto-skipped if officer has none)',
    MANAGER:           'Manager (nearest in chain; managers-group fallback)',
    DEPT_HEAD:         'Department Head',
    BOM:               'Branch Operations Manager',
    BRANCH_MANAGER:    'Branch Manager',
    ADMIN:             'Admin',
    GROUP_EMAIL:       'Group Email',
    SPECIFIC_USER:     'Specific User',
    REQUESTER:         'Requester',
};

export const APPROVER_SUBJECT_LABELS: Record<ApproverSubject, string> = {
    REQUESTER: 'The requester',
    ISSUER:    'The issuer (who issued the items)',
};

/** Role-based approver types whose reporting line can target the requester OR the issuer. */
export const SUBJECT_AWARE_APPROVER_TYPES: ApproverType[] = [
    'DIRECT_SUPERVISOR', 'SUPERVISOR', 'MANAGER', 'DEPT_HEAD', 'BOM', 'BRANCH_MANAGER',
];

export const BRANCH_SCOPE_LABELS: Record<BranchScope, string> = {
    ALL:         'All Branches',
    HEAD_OFFICE: 'Head Office Only',
    BRANCH:      'Branch Only',
};

export const NOTIFY_GROUP_SOURCE_LABELS: Record<NotifyGroupSource, string> = {
    STATIC:                       'Specific email address',
    REQUESTER_MANAGERS_GROUP:     "Requester's managers group (dynamic)",
    REQUESTER:                    'Requester',
    REQUESTER_DIRECT_SUPERVISOR:  "Requester's direct supervisor",
    ADMIN:                        'Admin',
    NONE:                         'No CC',
};

/** Recipients available on the "Notify on completion" multi-select. Excludes STATIC and NONE — those only make sense for the CC dropdown. */
export const COMPLETION_NOTIFY_SOURCES: NotifyGroupSource[] = [
    'REQUESTER',
    'REQUESTER_DIRECT_SUPERVISOR',
    'REQUESTER_MANAGERS_GROUP',
    'ADMIN',
];

export interface IApprovalWorkflowsAxiosResponse extends IAxiosResponse {
    data: IApprovalWorkflow[];
}

export interface IApprovalWorkflowAxiosResponse extends IAxiosResponse {
    data: IApprovalWorkflow;
}

/** A single resolved step from GET /approval-workflows/resolve — includes the actual approver chosen for this request. */
export interface IResolvedApprovalStep {
    stepOrder: number;
    stepName: string;
    stepType: StepType;
    approverType: ApproverType;
    /** Resolved approver name (e.g. "Jane Doe"). Null when the step routes only to a group email. */
    approverName?: string | null;
    /** Resolved approver email. */
    approverEmail?: string | null;
    /** Fallback email group used if the approver is unavailable (e.g. their manager group). */
    fallbackEmail?: string | null;
    skipped: boolean;
    /** Reason for skipping, surfaced for transparency (e.g. "Requester is a Manager"). */
    skipReason?: string | null;
    optional: boolean;
}

export interface IResolvedApprovalWorkflow {
    workflowId: number | null;
    workflowName: string | null;
    /** Email group notified to fulfil the request after all approvals (from the asset category). */
    fulfilmentGroupEmail?: string | null;
    resolvedSteps: IResolvedApprovalStep[];
    /** Backend-supplied human-readable reason when no workflow matched. */
    noMatchReason?: string | null;
}

export interface IResolvedApprovalWorkflowAxiosResponse extends IAxiosResponse {
    data: IResolvedApprovalWorkflow;
}

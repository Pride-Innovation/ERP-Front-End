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
    | 'ISSUE'
    | 'APPROVE_ISSUANCE'
    | 'ACKNOWLEDGE_RECEIPT';

export type ApproverType =
    | 'DIRECT_SUPERVISOR'
    | 'DEPT_HEAD'
    | 'BOM'
    | 'BRANCH_MANAGER'
    | 'ADMIN'
    | 'GROUP_EMAIL'
    | 'SPECIFIC_USER';

export type BranchScope = 'ALL' | 'HEAD_OFFICE' | 'BRANCH';

export interface IApprovalStep {
    id?: number;
    stepOrder: number;
    stepName: string;
    stepType: StepType;
    approverType: ApproverType;
    groupEmail: string;
    specificUserId: string;
    notifyGroupEmail: string;
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
    ISSUE:               'Issue Asset',
    APPROVE_ISSUANCE:    'Approve Issuance',
    ACKNOWLEDGE_RECEIPT: 'Acknowledge Receipt',
};

export const APPROVER_TYPE_LABELS: Record<ApproverType, string> = {
    DIRECT_SUPERVISOR: 'Direct Supervisor',
    DEPT_HEAD:         'Department Head',
    BOM:               'Branch Operations Manager',
    BRANCH_MANAGER:    'Branch Manager',
    ADMIN:             'Admin',
    GROUP_EMAIL:       'Group Email',
    SPECIFIC_USER:     'Specific User',
};

export const BRANCH_SCOPE_LABELS: Record<BranchScope, string> = {
    ALL:         'All Branches',
    HEAD_OFFICE: 'Head Office Only',
    BRANCH:      'Branch Only',
};

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

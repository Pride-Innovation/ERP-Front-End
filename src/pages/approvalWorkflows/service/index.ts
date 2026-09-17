/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../core/apis/axiosInstance";
import { IApprovalWorkflow } from "../interface";

const fetchApprovalWorkflowsService = async () => {
    const response = await axiosInstance.get('approval-workflows');
    return response;
};

const createApprovalWorkflowService = async (body: IApprovalWorkflow) => {
    const response = await axiosInstance.post('approval-workflows', body);
    return response;
};

const updateApprovalWorkflowService = async (body: IApprovalWorkflow, id: string | number) => {
    const response = await axiosInstance.put(`approval-workflows/${id}`, body);
    return response;
};

const toggleApprovalWorkflowActiveService = async (id: string | number) => {
    const response = await axiosInstance.put(`approval-workflows/${id}/toggle-active`);
    return response;
};

const deleteApprovalWorkflowService = async (id: string | number) => {
    const response = await axiosInstance.delete(`approval-workflows/${id}`);
    return response;
};

const searchAssetTypesForWorkflowService = async (name?: string) => {
    const query = name ? `&name=${encodeURIComponent(name)}` : '';
    // Asset categories are a small, bounded set — load them all so the multi-select
    // shows every category and client-side filtering can narrow them without a refetch.
    const response = await axiosInstance.get(`asset-types?pageNumber=0&pageSize=200${query}`);
    return response;
};

const fetchBranchesForWorkflowService = async () => {
    const response = await axiosInstance.get('branches?pageNumber=0&pageSize=200');
    return response;
};

const fetchRolesForWorkflowService = async () => {
    const response = await axiosInstance.get('roles?pageNumber=0&pageSize=200');
    return response;
};

interface IResolveWorkflowParams {
    categoryId: number | string;
    branchId?: number | string | null;
    requesterId?: number | string | null;
}

/**
 * Resolves which workflow will run for a given (category, branch, requester) triple.
 * Backend endpoint: GET /api/v1/approval-workflows/resolve
 * Returns the matched workflow + ordered steps with concrete approvers and skip flags.
 */
const resolveApprovalWorkflowService = async ({
    categoryId,
    branchId,
    requesterId,
}: IResolveWorkflowParams) => {
    const params = new URLSearchParams();
    params.append('categoryId', String(categoryId));
    if (branchId != null && branchId !== '') params.append('branchId', String(branchId));
    if (requesterId != null && requesterId !== '') params.append('requesterId', String(requesterId));

    const response = await axiosInstance.get(`approval-workflows/resolve?${params.toString()}`);
    return response;
};

const searchUsersForWorkflowService = async (search?: string) => {
    const query = search ? `&name=${encodeURIComponent(search)}` : '';
    const response = await axiosInstance.get(`users?pageNumber=0&pageSize=10${query}`);
    return response;
};

export {
    fetchApprovalWorkflowsService,
    createApprovalWorkflowService,
    updateApprovalWorkflowService,
    toggleApprovalWorkflowActiveService,
    deleteApprovalWorkflowService,
    searchAssetTypesForWorkflowService,
    fetchBranchesForWorkflowService,
    fetchRolesForWorkflowService,
    resolveApprovalWorkflowService,
    searchUsersForWorkflowService,
};

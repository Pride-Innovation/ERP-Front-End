/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { IBranch } from "../settings/branch/interface";
import { IRole } from "../settings/interface";
import { IApprovalStep, IApprovalWorkflow } from "./interface";
import {
    addApprovalWorkflow,
    loadAllApprovalWorkflows,
    removeApprovalWorkflow,
    toggleApprovalWorkflowActive,
    updateApprovalWorkflow,
} from "./slice";
import {
    createApprovalWorkflowService,
    deleteApprovalWorkflowService,
    fetchApprovalWorkflowsService,
    fetchBranchesForWorkflowService,
    fetchRolesForWorkflowService,
    toggleApprovalWorkflowActiveService,
    updateApprovalWorkflowService,
} from "./service";

export const blankApprovalStep = (order = 1): IApprovalStep => ({
    stepOrder: order,
    stepName: '',
    stepType: 'ACKNOWLEDGE_REQUEST',
    approverType: 'DIRECT_SUPERVISOR',
    groupEmail: '',
    specificUserId: '',
    notifyGroupEmail: '',
    notifyGroupSource: 'STATIC',
    notifyOnCompletion: [],
    optional: false,
    escalationHours: 48,
    skipIfRequesterRoleIds: [],
});

export const blankApprovalWorkflow = (): IApprovalWorkflow => ({
    name: '',
    description: '',
    assetTypeIds: [],
    branchId: null,
    branchScope: 'ALL',
    active: true,
    priority: 0,
    requesterRoleIds: [],
    steps: [blankApprovalStep(1)],
});

const ApprovalWorkflowUtills = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [branches, setBranches] = useState<IBranch[]>([]);
    const [roles, setRoles] = useState<IRole[]>([]);
    const dispatch = useDispatch<AppDispatch>();

    const fetchAllApprovalWorkflows = async () => {
        setLoading(true);
        try {
            const response = await fetchApprovalWorkflowsService();
            if (response.status === 200) {
                dispatch(loadAllApprovalWorkflows(response.data));
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    const fetchBranchesForWorkflow = async () => {
        try {
            const response = await fetchBranchesForWorkflowService();
            setBranches(response.data?.content ?? []);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchRolesForWorkflow = async () => {
        try {
            const response = await fetchRolesForWorkflowService();
            setRoles(response.data?.content ?? response.data ?? []);
        } catch (error) {
            console.log(error);
        }
    };

    const saveWorkflow = async (dto: IApprovalWorkflow) => {
        if (dto.id) {
            const response = await updateApprovalWorkflowService(dto, dto.id);
            if (response.status >= 200 && response.status < 300) {
                dispatch(updateApprovalWorkflow(response.data ?? dto));
            }
            return response;
        }
        const response = await createApprovalWorkflowService(dto);
        if (response.status >= 200 && response.status < 300) {
            dispatch(addApprovalWorkflow(response.data ?? dto));
        }
        return response;
    };

    const toggleWorkflow = async (workflow: IApprovalWorkflow) => {
        if (!workflow.id) return;
        const response = await toggleApprovalWorkflowActiveService(workflow.id);
        if (response.status >= 200 && response.status < 300) {
            dispatch(toggleApprovalWorkflowActive({
                id: workflow.id,
                active: !workflow.active,
            }));
        }
        return response;
    };

    const deleteWorkflow = async (workflow: IApprovalWorkflow) => {
        if (!workflow.id) return;
        const response = await deleteApprovalWorkflowService(workflow.id);
        if (response.status >= 200 && response.status < 300) {
            dispatch(removeApprovalWorkflow({ id: workflow.id }));
        }
        return response;
    };

    return {
        loading,
        branches,
        roles,
        fetchAllApprovalWorkflows,
        fetchBranchesForWorkflow,
        fetchRolesForWorkflow,
        saveWorkflow,
        toggleWorkflow,
        deleteWorkflow,
    };
};

export default ApprovalWorkflowUtills;

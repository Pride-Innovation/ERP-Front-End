/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IApprovalWorkflow } from "../interface";

interface IApprovalWorkflowState {
    workflows: Array<IApprovalWorkflow>;
}

const initialState: IApprovalWorkflowState = {
    workflows: [],
};

const approvalWorkflowSlice = createSlice({
    name: "approvalWorkflows",
    initialState,
    reducers: {
        loadAllApprovalWorkflows: (state, action: PayloadAction<IApprovalWorkflow[]>) => {
            state.workflows = action.payload;
        },
        addApprovalWorkflow: (state, action: PayloadAction<IApprovalWorkflow>) => {
            state.workflows = [...state.workflows, action.payload];
        },
        updateApprovalWorkflow: (state, action: PayloadAction<IApprovalWorkflow>) => {
            state.workflows = state.workflows.map(wf =>
                wf.id === action.payload?.id ? action.payload : wf
            );
        },
        toggleApprovalWorkflowActive: (state, action: PayloadAction<{ id: number; active: boolean }>) => {
            state.workflows = state.workflows.map(wf =>
                wf.id === action.payload.id ? { ...wf, active: action.payload.active } : wf
            );
        },
        removeApprovalWorkflow: (state, action: PayloadAction<{ id: number | string }>) => {
            state.workflows = state.workflows.filter(wf => wf.id !== action.payload?.id);
        },
    },
});

const { actions, reducer } = approvalWorkflowSlice;
export const {
    loadAllApprovalWorkflows,
    addApprovalWorkflow,
    updateApprovalWorkflow,
    toggleApprovalWorkflowActive,
    removeApprovalWorkflow,
} = actions;
export default reducer;

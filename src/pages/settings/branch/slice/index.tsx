/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice } from '@reduxjs/toolkit';
import { IBranch } from '../interface';

interface IBranchState {
    branches: IBranch[];
}

const initialState: IBranchState = {
    branches: []
}

export const authSlice = createSlice({
    name: 'branches',
    initialState,
    reducers: {
        loadBranches: (state, action) => {
            state.branches = action.payload;
        },
        addBranch: (state, action) => {
            state.branches = [action.payload, ...state.branches]
        },
        removeBranch: (state, action) => {
            state.branches = state.branches.filter(branch => branch?.id !== action.payload?.id)
        },
        updateBranch: (state, action) => {
            state.branches = state.branches.map(branch => branch?.id === action?.payload?.id ? action?.payload : branch)
        }
    }
})

const { reducer, actions } = authSlice

export const {
    loadBranches,
    addBranch,
    removeBranch,
    updateBranch
} = actions

export default reducer;
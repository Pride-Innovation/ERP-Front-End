import { createSlice } from '@reduxjs/toolkit';
import { IBranch } from '../../../assets/ITEquipment/interface';


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
        }
    }
})

const { reducer, actions } = authSlice

export const {
    loadBranches,
    addBranch,
    removeBranch
} = actions

export default reducer;
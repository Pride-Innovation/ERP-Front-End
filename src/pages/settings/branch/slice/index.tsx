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
        }
    }
})

const { reducer, actions } = authSlice

export const {
    loadBranches,
    addBranch
} = actions

export default reducer;
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
    }
})

const { reducer, actions } = authSlice

export const {
    loadBranches
} = actions

export default reducer;
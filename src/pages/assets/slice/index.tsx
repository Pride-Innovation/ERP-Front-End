import { createSlice } from '@reduxjs/toolkit';
import {
    IAsssetCategory,
    IAsssetStatus,
    IBranch,
    IUnitOfMeasure
} from '../ITEquipment/interface';
import { IUser } from '../../users/interface';

interface IITEquipmentState {
    assetsStatuses: IAsssetStatus[];
    users: IUser[];
    branches: IBranch[];
    assetCategories: IAsssetCategory[];
    unitsOfMeasures: IUnitOfMeasure[];
}

const initialState: IITEquipmentState = {
    assetsStatuses: [],
    users: [],
    branches: [],
    assetCategories: [],
    unitsOfMeasures: [],
}

export const authSlice = createSlice({
    name: 'assets',
    initialState,
    reducers: {
        loadAssetStatuses: (state, action) => {
            state.assetsStatuses = action.payload;
        },
        loadUsers: (state, action) => {
            state.users = action.payload;
        },
        loadBranches: (state, action) => {
            state.branches = action.payload;
        },
        loadAssetCategories: (state, action) => {
            state.assetCategories = action.payload;
        },
        loadUnitOfMeasures: (state, action) => {
            state.unitsOfMeasures = action.payload;
        },
    }
})

const { reducer, actions } = authSlice

export const {
    loadAssetStatuses,
    loadUsers,
    loadBranches,
    loadAssetCategories,
    loadUnitOfMeasures
} = actions

export default reducer;
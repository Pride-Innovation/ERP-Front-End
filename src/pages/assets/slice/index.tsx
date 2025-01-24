import { createSlice } from '@reduxjs/toolkit';
import {
    IAsssetCategory,
    IAsssetStatus,
    ISupplier,
    IUnitOfMeasure
} from '../ITEquipment/interface';
import { IUser } from '../../users/interface';

interface IITEquipmentState {
    assetsStatuses: IAsssetStatus[];
    users: IUser[];
    assetCategories: IAsssetCategory[];
    unitsOfMeasures: IUnitOfMeasure[];
    suppliers: ISupplier[];
}

const initialState: IITEquipmentState = {
    assetsStatuses: [],
    users: [],
    assetCategories: [],
    unitsOfMeasures: [],
    suppliers: []
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
        loadAssetCategories: (state, action) => {
            state.assetCategories = action.payload;
        },
        loadUnitOfMeasures: (state, action) => {
            state.unitsOfMeasures = action.payload;
        },
        loadSuppliers: (state, action) => {
            state.suppliers = action.payload;
        },
    }
})

const { reducer, actions } = authSlice

export const {
    loadAssetStatuses,
    loadUsers,
    loadAssetCategories,
    loadUnitOfMeasures,
    loadSuppliers
} = actions

export default reducer;
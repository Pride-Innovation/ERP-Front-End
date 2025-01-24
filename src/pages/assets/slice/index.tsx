import { createSlice } from '@reduxjs/toolkit';
import {
    IAsssetCategory,
    IAsssetStatus,
    ISupplier
} from '../ITEquipment/interface';
import { IUser } from '../../users/interface';

interface IITEquipmentState {
    assetsStatuses: IAsssetStatus[];
    users: IUser[];
    assetCategories: IAsssetCategory[];
    suppliers: ISupplier[];
}

const initialState: IITEquipmentState = {
    assetsStatuses: [],
    users: [],
    assetCategories: [],
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
    loadSuppliers
} = actions

export default reducer;
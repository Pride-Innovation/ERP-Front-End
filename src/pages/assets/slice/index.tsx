import { createSlice } from '@reduxjs/toolkit';
import {
    IAsssetCategory,
    // IAsssetStatus,
} from '../ITEquipment/interface';
import { IUser } from '../../users/interface';

interface IITEquipmentState {
    // assetsStatuses: IAsssetStatus[];
    users: IUser[];
    assetCategories: IAsssetCategory[];
}

const initialState: IITEquipmentState = {
    // assetsStatuses: [],
    users: [],
    assetCategories: [],
}

export const authSlice = createSlice({
    name: 'assets',
    initialState,
    reducers: {
        // loadAssetStatuses: (state, action) => {
        //     state.assetsStatuses = action.payload;
        // },
        loadUsers: (state, action) => {
            state.users = action.payload;
        },
        loadAssetCategories: (state, action) => {
            state.assetCategories = action.payload;
        },
    }
})

const { reducer, actions } = authSlice

export const {
    // loadAssetStatuses,
    loadUsers,
    loadAssetCategories,
} = actions

export default reducer;
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice } from '@reduxjs/toolkit';
import { IAsssetCategory } from '../ITEquipment/interface';
import { IUser } from '../../users/interface';

interface IITEquipmentState {
    users: IUser[];
    assetCategories: IAsssetCategory[];
}

const initialState: IITEquipmentState = {
    users: [],
    assetCategories: [],
}

export const authSlice = createSlice({
    name: 'assets',
    initialState,
    reducers: {
        // loadUsers: (state, action) => {
        //     state.users = action.payload;
        // },
        loadAssetCategories: (state, action) => {
            state.assetCategories = action.payload;
        },
    }
})

const { reducer, actions } = authSlice

export const {
    // loadUsers,
    loadAssetCategories,
} = actions

export default reducer;
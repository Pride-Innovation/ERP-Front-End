/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice } from '@reduxjs/toolkit';
import { IAsssetCategory } from '../ITEquipment/interface';

interface IITEquipmentState {
    assetCategories: IAsssetCategory[];
}

const initialState: IITEquipmentState = {
    assetCategories: [],
}

export const authSlice = createSlice({
    name: 'assets',
    initialState,
    reducers: {
        loadAssetCategories: (state, action) => {
            state.assetCategories = action.payload;
        },
    }
})

const { reducer, actions } = authSlice

export const {
    loadAssetCategories,
} = actions

export default reducer;
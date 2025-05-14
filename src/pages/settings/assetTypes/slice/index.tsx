/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import { createSlice } from "@reduxjs/toolkit";
import { IAssetType } from "../interface";

interface IAssetTypeState {
    assetTypes: Array<IAssetType>
}

const initialState: IAssetTypeState = {
    assetTypes: []
}


const assetTypeSlice = createSlice({
    name: "assetTypes",
    initialState,
    reducers: {
        loadAllAssetTypes: (state, action) => {
            state.assetTypes = action.payload
        }
    }
});

const { actions, reducer } = assetTypeSlice;
export const { loadAllAssetTypes } = actions;
export default reducer;
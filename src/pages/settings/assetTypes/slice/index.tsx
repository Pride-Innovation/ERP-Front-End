/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import { createSlice } from "@reduxjs/toolkit";
import { IAssetType } from "../interface";

interface IAssetTypeState {
    assetTypes: Array<IAssetType>;
    totalPages: number;
    totalElements: number;
}

const initialState: IAssetTypeState = {
    assetTypes: [],
    totalPages: 0,
    totalElements: 0,
}

const assetTypeSlice = createSlice({
    name: "assetTypes",
    initialState,
    reducers: {
        loadAllAssetTypes: (state, action) => {
            state.assetTypes = action.payload;
        },
        setPaginationMeta: (state, action) => {
            state.totalPages = action.payload.totalPages;
            state.totalElements = action.payload.totalElements;
        },
        addAssetType: (state, action) => {
            state.assetTypes = [...state.assetTypes, action.payload];
        },
        updateAssetType: (state, action) => {
            state.assetTypes = state.assetTypes.map(at =>
                at.id === action.payload?.id ? action.payload : at
            );
        },
        updateAssetTypeFieldConfig: (state, action) => {
            // action.payload = { id, fieldConfig }
            state.assetTypes = state.assetTypes.map(at =>
                at.id === action.payload?.id
                    ? { ...at, fieldConfig: action.payload.fieldConfig }
                    : at
            );
        },
        removeAssetType: (state, action) => {
            state.assetTypes = state.assetTypes.filter(at => at.id !== action.payload?.id);
        },
    }
});

const { actions, reducer } = assetTypeSlice;
export const {
    loadAllAssetTypes,
    setPaginationMeta,
    addAssetType,
    updateAssetType,
    updateAssetTypeFieldConfig,
    removeAssetType,
} = actions;
export default reducer;

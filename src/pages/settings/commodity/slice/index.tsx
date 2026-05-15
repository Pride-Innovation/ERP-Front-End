/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import { createSlice } from "@reduxjs/toolkit";
import { ICommodity } from "../interface";

interface ICommodityState {
    commodities: Array<ICommodity>;
    totalPages: number;
    totalElements: number;
}

const initialState: ICommodityState = {
    commodities: [],
    totalPages: 0,
    totalElements: 0,
}

const commoditySlice = createSlice({
    name: "commodities",
    initialState,
    reducers: {
        loadAllCommodities: (state, action) => {
            state.commodities = action.payload
        },
        setPaginationMeta: (state, action) => {
            state.totalPages = action.payload.totalPages;
            state.totalElements = action.payload.totalElements;
        },
        addCommodity: (state, action) => {
            state.commodities = [...state.commodities, action.payload]
        },
        updateCommodity: (state, action) => {
            state.commodities = state.commodities.map(commodity => commodity.id === action.payload?.id ? action.payload : commodity)
        },
        deleteCommodity: (state, action) => {
            state.commodities = state.commodities.filter(commodity => commodity.id !== action.payload?.id)
        }
    }
});

const { actions, reducer } = commoditySlice;
export const { loadAllCommodities, setPaginationMeta, addCommodity, updateCommodity, deleteCommodity } = actions;
export default reducer;
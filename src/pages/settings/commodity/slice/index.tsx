/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import { createSlice } from "@reduxjs/toolkit";
import { ICommodity } from "../interface";

interface ICommodityState {
    commodities: Array<ICommodity>
}

const initialState: ICommodityState = {
    commodities: []
}

const commoditySlice = createSlice({
    name: "commodities",
    initialState,
    reducers: {
        loadAllCommodities: (state, action) => {
            state.commodities = action.payload
        },
        addCommodity: (state, action) => {
            state.commodities = [...state.commodities, action.payload]
        }
    }
});

const { actions, reducer } = commoditySlice;
export const { loadAllCommodities, addCommodity } = actions;
export default reducer;
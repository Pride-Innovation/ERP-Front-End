/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice } from "@reduxjs/toolkit";
import { IRequest } from "../../interface";

interface IRequestState {
    assetsRequests: Array<IRequest>
}

const initialState: IRequestState = {
    assetsRequests: []
}

export const requestSlice = createSlice({
    name: "assetsRequests",
    initialState,
    reducers: {
        loadAllRequests: (state, action) => {
            state.assetsRequests = action?.payload
        },
        removeAssetRequest: (state, action) => {
            state.assetsRequests = state.assetsRequests.filter(asset => asset?.id !== action?.payload?.id)
        }
    }
});

const { actions, reducer } = requestSlice;
export const { loadAllRequests, removeAssetRequest } = actions;
export default reducer;
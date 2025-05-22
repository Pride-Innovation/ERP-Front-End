/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice } from "@reduxjs/toolkit";
import { IRequest } from "../../interface";

interface IRequestState {
    requests: Array<IRequest>
}

const initialState: IRequestState = {
    requests: []
}

export const requestSlice = createSlice({
    name: "requests",
    initialState,
    reducers: {
        loadAllRequests: (state, action) => {
            state.requests = action?.payload
        },
        removeAssetRequest: (state, action) => {
            state.requests = state.requests.filter(asset => asset?.id !== action?.payload?.id)
        }
    }
});

const { actions, reducer } = requestSlice;
export const { loadAllRequests, removeAssetRequest } = actions;
export default reducer;
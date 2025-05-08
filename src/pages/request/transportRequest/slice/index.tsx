/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice } from "@reduxjs/toolkit";
import { ITransportRequest } from "../../interface";

interface ITransportRequestState {
    allTranportRequests: Array<ITransportRequest>
}
const initialState: ITransportRequestState = {
    allTranportRequests: []
}

export const transportRequestSlice = createSlice({
    name: "transportRequests",
    initialState,
    reducers: {
        loadAllTransportRequest: (state, action) => {
            state.allTranportRequests = action.payload
        },
        addNewTransportRequest: (state, action) => {
            state.allTranportRequests = [action.payload, state.allTranportRequests]
        },
        removeTransportRequest: (state, action) => {
            state.allTranportRequests = state.allTranportRequests.filter(request => request?.id !== action?.payload?.id)
        }
    }
});

const { reducer, actions } = transportRequestSlice;

export const {
    loadAllTransportRequest,
    addNewTransportRequest,
    removeTransportRequest
} = actions;

export default reducer;
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice } from "@reduxjs/toolkit";
import { IStatus } from "../interface";

interface IStatusState {
    statuses: Array<IStatus>;
}

const initialState: IStatusState = {
    statuses: []
}


export const statusSlice = createSlice({
    name: "statuses",
    initialState,
    reducers: {
        loadStatuses: (state, action) => {
            state.statuses = action.payload;
        },
        addStatus: (state, action) => {
            state.statuses = [action.payload, ...state.statuses];
        },
        updateStatus: (state, action) => {
            state.statuses = state.statuses.map(status => status.id === action.payload?.id ? action.payload : status);
        },
        removeStatus: (state, action) => {
            state.statuses = state.statuses.filter(status => status?.id !== action.payload?.id);
        },
    }
})

const { reducer, actions } = statusSlice

export const {
    loadStatuses,
    addStatus,
    updateStatus,
    removeStatus
} = actions;

export default reducer;
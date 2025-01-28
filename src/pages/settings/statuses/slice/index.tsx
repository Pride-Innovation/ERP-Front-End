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
            state.statuses = state.statuses.map(status => status.id === action.payload?.id ? action.payload : status)
        },
    }
})

const { reducer, actions } = statusSlice

export const {
    loadStatuses,
    addStatus,
    updateStatus
} = actions;

export default reducer;
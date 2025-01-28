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
    }
})

const { reducer, actions } = statusSlice

export const {
    loadStatuses
} = actions;

export default reducer;
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
            state.allTranportRequests = [action.payload, state.allTranportRequests]
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
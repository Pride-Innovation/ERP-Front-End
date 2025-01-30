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
        }
    }
});

const { actions, reducer } = requestSlice;
export const { loadAllRequests } = actions;
export default reducer;
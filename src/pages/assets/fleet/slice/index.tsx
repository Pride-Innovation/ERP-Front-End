import { createSlice } from "@reduxjs/toolkit";
import { IFleet } from "../interface";

interface IFleetState {
    fleetAssets: IFleet[]
}

const initialState: IFleetState = {
    fleetAssets: []
}

const fleetSlice = createSlice({
    name: "fleet",
    initialState,
    reducers: {
        loadAllFleet: (state, action) => {
            state.fleetAssets = action.payload
        }
    }
});

const { actions, reducer } = fleetSlice;
export const { loadAllFleet } = actions;
export default reducer;
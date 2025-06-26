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
        },
        updateFleetAsset: (state, action) => {
            state.fleetAssets = state.fleetAssets.map(asset => asset.id === action.payload?.id ? action.payload : asset)
        }
    }
});

const { actions, reducer } = fleetSlice;
export const { loadAllFleet, updateFleetAsset } = actions;
export default reducer;
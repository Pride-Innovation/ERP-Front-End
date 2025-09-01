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
        },
        disposeFleetAsset: (state, action) => {
            state.fleetAssets = state.fleetAssets.filter((asset) => asset.id !== action.payload.id)
        }
    }
});

const { actions, reducer } = fleetSlice;
export const { loadAllFleet, updateFleetAsset, disposeFleetAsset } = actions;
export default reducer;
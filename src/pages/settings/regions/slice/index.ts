import { createSlice } from "@reduxjs/toolkit";
import { IRegion } from "../../branch/interface";

interface IRegionState {
    regions: Array<IRegion>
}

const initialState: IRegionState = {
    regions: []
};

const regionSlice = createSlice({
    name: "regions",
    initialState,
    reducers: {
        loadAllRegions: (state, action) => {
            state.regions = action.payload;
        },
        addRegion: (state, action) => {
            // add at the beginning 
            state.regions.unshift(action.payload);
        },
        updateRegion: (state, action) => {
            state.regions.map(region => region.id === action.payload.id ? action.payload : region);
        },
        removeRegion: (state, action) => {
            state.regions = state.regions.filter(region => region.id !== action.payload.id);
        }
    }
});

const { actions, reducer } = regionSlice;
export const { loadAllRegions, addRegion, updateRegion, removeRegion } = actions;
export default reducer;
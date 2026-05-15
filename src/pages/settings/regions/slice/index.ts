import { createSlice } from "@reduxjs/toolkit";
import { IRegion } from "../interface";

interface IRegionState {
    regions: Array<IRegion>;
    totalPages: number;
    totalElements: number;
}

const initialState: IRegionState = {
    regions: [],
    totalPages: 0,
    totalElements: 0,
};

const regionSlice = createSlice({
    name: "regions",
    initialState,
    reducers: {
        loadAllRegions: (state, action) => {
            state.regions = action.payload;
        },
        setPaginationMeta: (state, action) => {
            state.totalPages = action.payload.totalPages;
            state.totalElements = action.payload.totalElements;
        },
        addRegion: (state, action) => {
            // add at the beginning 
            state.regions.unshift(action.payload);
        },
        updateRegion: (state, action) => {
            state.regions = state.regions.map(region =>
                region.id === action.payload.id ? action.payload : region
            );
        },
        removeRegion: (state, action) => {
            state.regions = state.regions.filter(region => region.id !== action.payload.id);
        }
    }
});

const { actions, reducer } = regionSlice;
export const { loadAllRegions, setPaginationMeta, addRegion, updateRegion, removeRegion } = actions;
export default reducer;
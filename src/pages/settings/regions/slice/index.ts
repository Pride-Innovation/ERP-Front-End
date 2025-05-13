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
        }
    }
});

const { actions, reducer } = regionSlice;
export const { loadAllRegions } = actions;
export default reducer;
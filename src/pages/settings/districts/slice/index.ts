import { createSlice } from "@reduxjs/toolkit";
import { IDistrict } from "../../branch/interface";

interface IDistrictState {
    districts: Array<IDistrict>;
}

const initialState: IDistrictState = {
    districts: []
}

const districtSlice = createSlice({
    name: "districts",
    initialState,
    reducers: {
        loadDistricts: (state, action) => {
            state.districts = action.payload
        }
    }
})

const { actions, reducer } = districtSlice;
export const { loadDistricts } = actions;
export default reducer;
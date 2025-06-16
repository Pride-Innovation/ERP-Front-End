import { createSlice } from "@reduxjs/toolkit";
import { IITEquipment } from "../interface";

interface IITEquipmentState {
    itAssets: IITEquipment[]
}

const initialState: IITEquipmentState = {
    itAssets: []
}


const itAssetsSlice = createSlice({
    name: "it assets",
    initialState,
    reducers: {
        loadAllITAssets: (state, action) => {
            state.itAssets = action.payload
        }
    }
})

const { actions, reducer } = itAssetsSlice;
export const { loadAllITAssets } = actions;
export default reducer;
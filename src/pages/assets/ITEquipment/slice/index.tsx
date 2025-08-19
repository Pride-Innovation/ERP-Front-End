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
        },
        updateITAsset: (state, action) => {
            state.itAssets = state.itAssets.map((asset) => asset.id === action.payload.id ? action.payload : asset)
        },
        disposeAsset: (state, action) => {
            state.itAssets = state.itAssets.filter((asset) => asset.id !== action.payload.id)
        }
    }
})

const { actions, reducer } = itAssetsSlice;
export const { loadAllITAssets, updateITAsset, disposeAsset } = actions;
export default reducer;
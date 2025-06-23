import { createSlice } from "@reduxjs/toolkit";
import { IAsset } from "../interface";

interface IAssetState {
    assets: IAsset[]
}

const initialState: IAssetState = {
    assets: []
}

const assetSlice = createSlice({
    name: "assets",
    initialState,
    reducers: {
        listAllAssets: (state, action) => {
            state.assets = action.payload
        }
    }
})

const { actions, reducer } = assetSlice;
export const { listAllAssets } = actions;
export default reducer;
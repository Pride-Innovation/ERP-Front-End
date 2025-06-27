import { createSlice } from "@reduxjs/toolkit";
import { IAssetAssignmentHistory } from "../interface";

interface IAssetAssignmentHistoryState {
    assetAssignmentHistory: IAssetAssignmentHistory[]
}

const initialState: IAssetAssignmentHistoryState = {
    assetAssignmentHistory: []
}

const assetAssignmentHistorySlice = createSlice({
    name: "AssetAssignmentHistory",
    initialState,
    reducers: {
        loadAssetAssignmentHistory: (state, action) => {
            state.assetAssignmentHistory = action.payload
        }
    }
})

const { actions, reducer } = assetAssignmentHistorySlice;
export const { loadAssetAssignmentHistory } = actions;
export default reducer;
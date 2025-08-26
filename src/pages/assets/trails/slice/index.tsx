import { createSlice } from "@reduxjs/toolkit";
import { IAssetAssignmentHistory } from "../interface";
import { IRepairDetails } from "../../interface";

interface IAssetAssignmentHistoryState {
    assetAssignmentHistory: IAssetAssignmentHistory[];
    assetRepairHistory: IRepairDetails[];
}

const initialState: IAssetAssignmentHistoryState = {
    assetAssignmentHistory: [],
    assetRepairHistory: []
}

const assetAssignmentHistorySlice = createSlice({
    name: "AssetAssignmentHistory",
    initialState,
    reducers: {
        loadAssetAssignmentHistory: (state, action) => {
            state.assetAssignmentHistory = action.payload
        },
        loadAssetRepairHistory: (state, action) => {
            state.assetRepairHistory = action.payload
        }
    }
})

const { actions, reducer } = assetAssignmentHistorySlice;
export const { loadAssetAssignmentHistory, loadAssetRepairHistory } = actions;
export default reducer;
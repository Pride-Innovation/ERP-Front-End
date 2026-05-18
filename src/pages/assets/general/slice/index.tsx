import { createSlice } from "@reduxjs/toolkit";
import { IOfficeEquipment } from "../../officeEquipment/interface";

interface IGeneralAssetState {
    generalAssets: IOfficeEquipment[];
}

const initialState: IGeneralAssetState = {
    generalAssets: []
};

const generalAssetSlice = createSlice({
    name: "generalAssets",
    initialState,
    reducers: {
        loadAllGeneralAssets: (state, action) => {
            state.generalAssets = action.payload;
        },
        updateGeneralAssetInStore: (state, action) => {
            const index = state.generalAssets.findIndex(a => a.id === action.payload.id);
            if (index !== -1) {
                state.generalAssets[index] = action.payload;
            }
        },
        disposeGeneralAssetFromStore: (state, action) => {
            state.generalAssets = state.generalAssets.filter(a => a.id !== action.payload);
        }
    }
});

const { actions, reducer } = generalAssetSlice;
export const { loadAllGeneralAssets, updateGeneralAssetInStore, disposeGeneralAssetFromStore } = actions;
export default reducer;

import { createSlice } from "@reduxjs/toolkit";
import { IOfficeEquipment } from "../interface";

interface IOfficeEquipmentState {
    officeAsset: IOfficeEquipment[]
}

const initialState: IOfficeEquipmentState = {
    officeAsset: []
}

const officeEquipmentSlice = createSlice({
    name: "office Equipment",
    initialState,
    reducers: {
        loadAllOfficeAssets: (state, action) => {
            state.officeAsset = action.payload
        }
    }
})

const { reducer, actions } = officeEquipmentSlice;
export const { loadAllOfficeAssets } = actions;
export default reducer;
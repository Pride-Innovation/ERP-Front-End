/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

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
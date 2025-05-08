/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice } from "@reduxjs/toolkit";
import { IInventory } from "../interface";

interface IInventoryState {
    inventoryList: IInventory[]
}

const initialState: IInventoryState = {
    inventoryList: []
};

export const inventorySlice = createSlice({
    name: "inventory",
    initialState,
    reducers: {
        loadAllInventory: (state, action) => {
            state.inventoryList = action.payload
        }
    }
});

const { actions, reducer } = inventorySlice;

export const { loadAllInventory } = actions;
export default reducer
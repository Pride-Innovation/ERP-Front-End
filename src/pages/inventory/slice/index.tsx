/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice } from "@reduxjs/toolkit";
import { IInventory } from "../interface";

interface IInventoryState {
    inventory: IInventory[]
}

const initialState: IInventoryState = {
    inventory: []
};

export const inventorySlice = createSlice({
    name: "inventory",
    initialState,
    reducers: {
        loadAllInventory: (state, action) => {
            state.inventory = action.payload
        },
        deleteInventory: (state, action) => {
            state.inventory = state.inventory.filter(item => item.id !== action.payload);
        }
    }
});

const { actions, reducer } = inventorySlice;

export const { loadAllInventory, deleteInventory } = actions;
export default reducer
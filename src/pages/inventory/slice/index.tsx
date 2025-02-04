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
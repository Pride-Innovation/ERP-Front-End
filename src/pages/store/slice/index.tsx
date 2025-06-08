import { createSlice } from "@reduxjs/toolkit";
import { IStore } from "../interface";

interface IStoreState {
    stores: IStore[]
}

const initialState: IStoreState = {
    stores: []
}

const storeSlice = createSlice({
    name: "stores",
    initialState,
    reducers: {
        loadAllStores: (state, action) => {
            state.stores = action.payload;
        }
    }
})

const { reducer, actions } = storeSlice;
export const { loadAllStores } = actions;
export default reducer;
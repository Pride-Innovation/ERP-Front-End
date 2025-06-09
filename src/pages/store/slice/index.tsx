/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

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
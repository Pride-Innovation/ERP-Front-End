/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice } from "@reduxjs/toolkit";
import { ITitle } from "../interface";

interface ITitleState {
    titles: Array<ITitle>
}

const initialState: ITitleState = {
    titles: []
}

const titleSlice = createSlice({
    name: "titles",
    initialState,
    reducers: {
        loadAllTitles: (state, action) => {
            state.titles = action.payload
        },
        addTitle: (state, action) => {
            state.titles = [...state.titles, action.payload]
        },
        updateTitle: (state, action) => {
            state.titles = state.titles.map(title => title.id === action.payload.id ? action.payload : title)
        },
        removeTitle: (state, action) => {
            state.titles = state.titles.filter(title => title.id !== action.payload?.id)
        }
    }
});

const { actions, reducer } = titleSlice;
export const { loadAllTitles, addTitle, updateTitle, removeTitle } = actions;
export default reducer;
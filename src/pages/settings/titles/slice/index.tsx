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
        }
    }
});

const { actions, reducer } = titleSlice;
export const { loadAllTitles } = actions;
export default reducer;
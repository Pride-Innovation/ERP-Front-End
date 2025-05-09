/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice } from "@reduxjs/toolkit";
import { IUnit } from "../interface";

interface IUnitState {
    units: Array<IUnit>
}

const initialState: IUnitState = {
    units: []
}

export const unitSlice = createSlice({
    name: "units",
    initialState,
    reducers: {
        loadAllUnits: (state, action) => {
            state.units = action.payload
        },
        addUnit: (state, action) => {
            state.units = [action.payload, ...state.units]
        },
        removeUnit: (state, action) => {
            state.units = state.units.filter(unit => unit.id !== action.payload.id)
        },
        updateUnit: (state, action) => {
            state.units = state.units.map(unit => unit.id === action.payload.id ? action.payload : unit)
        }
    }
});

const { actions, reducer } = unitSlice;

export const { loadAllUnits, addUnit, removeUnit, updateUnit } = actions;
export default reducer;
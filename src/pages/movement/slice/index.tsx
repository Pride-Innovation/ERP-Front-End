/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice } from '@reduxjs/toolkit';
import { IMovement } from '../interface';

interface IMovementState {
    movements: Array<IMovement>;
}

const initialState: IMovementState = {
    movements: [],
};

export const movementSlice = createSlice({
    name: 'movements',
    initialState,
    reducers: {
        loadAllMovements: (state, action) => {
            state.movements = action.payload;
        },
        addMovement: (state, action) => {
            state.movements = [action.payload, ...state.movements];
        },
        updateMovement: (state, action) => {
            state.movements = state.movements.map(m =>
                m.id === action.payload.id ? { ...m, ...action.payload } : m
            );
        },
        removeMovement: (state, action) => {
            state.movements = state.movements.filter(m => m.id !== action.payload.id);
        },
    },
});

const { actions, reducer } = movementSlice;
export const { loadAllMovements, addMovement, updateMovement, removeMovement } = actions;
export default reducer;

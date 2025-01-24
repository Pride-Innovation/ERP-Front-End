import { createSlice } from '@reduxjs/toolkit';
import { IUnitOfMeasure } from '../interface';

interface IUnitOfMeasureState {
    unitsOfMeasure: IUnitOfMeasure[];
}

const initialState: IUnitOfMeasureState = {
    unitsOfMeasure: []
}

export const authSlice = createSlice({
    name: 'unitsOfMeasure',
    initialState,
    reducers: {
        loadUnitOfMeasures: (state, action) => {
            state.unitsOfMeasure = action.payload;
        },
        addUnitOfMeasure: (state, action) => {
            state.unitsOfMeasure = [action.payload, ...state.unitsOfMeasure]
        },
        removeUnitOfMeasure: (state, action) => {
            state.unitsOfMeasure = state.unitsOfMeasure.filter(unitsOfMeasure => unitsOfMeasure?.id !== action.payload?.id)
        },
        updateUnitOfMeasure: (state, action) => {
            state.unitsOfMeasure = state.unitsOfMeasure.map(unitsOfMeasure => unitsOfMeasure?.id === action?.payload?.id ? action?.payload : unitsOfMeasure)
        }
    }
})

const { reducer, actions } = authSlice

export const {
    loadUnitOfMeasures,
    addUnitOfMeasure,
    removeUnitOfMeasure,
    updateUnitOfMeasure
} = actions

export default reducer;
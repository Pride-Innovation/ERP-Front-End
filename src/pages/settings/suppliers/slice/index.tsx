/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice } from '@reduxjs/toolkit';
import { ISupplier } from '../interface';


interface ISupplierState {
    suppliers: ISupplier[];
    totalPages: number;
    totalElements: number;
}

const initialState: ISupplierState = {
    suppliers: [],
    totalPages: 0,
    totalElements: 0,
}

export const supplierSlice = createSlice({
    name: 'suppliers',
    initialState,
    reducers: {
        loadSuppliers: (state, action) => {
            state.suppliers = action.payload;
        },
        setPaginationMeta: (state, action) => {
            state.totalPages = action.payload.totalPages;
            state.totalElements = action.payload.totalElements;
        },
        addSupplier: (state, action) => {
            state.suppliers = [action.payload, ...state.suppliers]
        },
        removeSupplier: (state, action) => {
            state.suppliers = state.suppliers.filter(supplier => supplier?.id !== action.payload?.id)
        },
        updateSupplier: (state, action) => {
            state.suppliers = state.suppliers.map(supplier => supplier?.id === action?.payload?.id ? action?.payload : supplier)
        }
    }
})

const { reducer, actions } = supplierSlice

export const {
    loadSuppliers,
    setPaginationMeta,
    addSupplier,
    removeSupplier,
    updateSupplier
} = actions

export default reducer;
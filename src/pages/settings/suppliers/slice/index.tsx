import { createSlice } from '@reduxjs/toolkit';
import { ISupplier } from '../interface';


interface ISupplierState {
    suppliers: ISupplier[];
}

const initialState: ISupplierState = {
    suppliers: []
}

export const authSlice = createSlice({
    name: 'suppliers',
    initialState,
    reducers: {
        loadSuppliers: (state, action) => {
            state.suppliers = action.payload;
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

const { reducer, actions } = authSlice

export const {
    loadSuppliers,
    addSupplier,
    removeSupplier,
    updateSupplier
} = actions

export default reducer;
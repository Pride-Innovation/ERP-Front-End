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
    }
})

const { reducer, actions } = authSlice

export const {
    loadSuppliers
} = actions

export default reducer;
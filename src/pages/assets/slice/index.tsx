import { createSlice } from '@reduxjs/toolkit';
import { IITEquipment } from '../ITEquipment/interface';

interface IITEquipmentState {
    assets: IITEquipment[]
}

const initialState: IITEquipmentState = {
    assets: []
}

export const authSlice = createSlice({
    name: 'assets',
    initialState,
    reducers: {
        laodAssets: (state, action) => {
            state.assets = action.payload;
        },
    }
})

const { reducer, actions } = authSlice

export const { laodAssets } = actions

export default reducer;
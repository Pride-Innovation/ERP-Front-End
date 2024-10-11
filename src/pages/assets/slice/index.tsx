import { createSlice } from '@reduxjs/toolkit';
import { IAsset } from '../interface';

interface IAssetState {
    assets: IAsset[]
}

const initialState: IAssetState = {
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
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice } from '@reduxjs/toolkit';
import { IUser } from '../../users/interface';

interface IITEquipmentState {
    users: IUser[];
}

const initialState: IITEquipmentState = {
    users: [],
}

export const authSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        loadUsers: (state, action) => {
            state.users = action.payload;
        },
        addUser: (state, action) => {
            state.users = [...state.users, action.payload]
        },
        updateUser: (state, action) => {
            state.users = state.users.map(user => user.id === action.payload?.id ? action.payload : user);
        }
    }
})

const { reducer, actions } = authSlice

export const {
    loadUsers,
    addUser,
    updateUser
} = actions

export default reducer;
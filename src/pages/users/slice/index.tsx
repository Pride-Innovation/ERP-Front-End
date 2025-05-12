/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice } from '@reduxjs/toolkit';
import { IUser } from '../../users/interface';
import { IRole } from '../../settings/interface';

interface IITEquipmentState {
    users: IUser[];
    rolesList: IRole[];
}

const initialState: IITEquipmentState = {
    users: [],
    rolesList: []
}

export const authSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        loadUsers: (state, action) => {
            state.users = action.payload;
        },
        loadRoles: (state, action) => {
            state.rolesList = action.payload;
        }
    }
})

const { reducer, actions } = authSlice

export const {
    loadUsers,
    loadRoles
} = actions

export default reducer;
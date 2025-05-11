/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice } from "@reduxjs/toolkit";
import { IRole } from "../../interface";

interface IRoletState {
    roles: Array<IRole>
}

const initialState: IRoletState = {
    roles: []
}

export const rolesSlice = createSlice({
    name: "roles",
    initialState,
    reducers: {
        loadAllRoles: (state, action) => {
            state.roles = action?.payload
        },
        removeRoles: (state, action) => {
            state.roles = state.roles.filter(role => role?.id !== action?.payload?.id)
        },
        updateRole: (state, action) => {
            state.roles = state.roles.map(role => role?.id === action?.payload?.id ? action.payload : role)
        },
        addRole: (state, action) => {
            state.roles = [action.payload, ...state.roles]
        }
    }
});

const { actions, reducer } = rolesSlice;
export const { loadAllRoles, removeRoles, updateRole, addRole } = actions;
export default reducer;
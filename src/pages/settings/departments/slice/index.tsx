/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createSlice } from "@reduxjs/toolkit";
import { IDepartment } from "../interface";

interface IDepartmentState {
    departments: Array<IDepartment>;
    totalPages: number;
    totalElements: number;
}

const initialState: IDepartmentState = {
    departments: [],
    totalPages: 0,
    totalElements: 0,
}

export const departmentSlice = createSlice({
    name: "departments",
    initialState,
    reducers: {
        loadAllDepartments: (state, action) => {
            state.departments = action.payload;
        },
        setPaginationMeta: (state, action) => {
            state.totalPages = action.payload.totalPages;
            state.totalElements = action.payload.totalElements;
        },
        addDepartment: (state, action) => {
            state.departments.unshift(action.payload);
        },
        removeDepartment: (state, action) => {
            state.departments = state.departments.filter(department => department.id !== action.payload?.id);
        },
        updateDepartment: (state, action) => {
            state.departments = state.departments.map(department => department.id === action.payload?.id ? action.payload : department)
        }
    }
})

const { reducer, actions } = departmentSlice;

export const {
    loadAllDepartments,
    setPaginationMeta,
    addDepartment,
    removeDepartment,
    updateDepartment
} = actions;

export default reducer;
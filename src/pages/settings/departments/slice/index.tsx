import { createSlice } from "@reduxjs/toolkit";
import { IDepartment } from "../interface";

interface IDepartmentState {
    departments: Array<IDepartment>;
}

const initialState: IDepartmentState = {
    departments: []
}

export const departmentSlice = createSlice({
    name: "departments",
    initialState,
    reducers: {
        loadAllDepartments: (state, action) => {
            state.departments = action.payload;
        },
        addDepartment: (state, action) => {
            state.departments = [action.payload, ...state.departments]
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
    addDepartment,
    removeDepartment,
    updateDepartment
} = actions;

export default reducer;
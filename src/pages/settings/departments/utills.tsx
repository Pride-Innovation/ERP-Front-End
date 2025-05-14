/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { useSelector } from "react-redux";
import { IDepartment, IDepartmentsAxiosResponse } from "./interface";
import { IFormData } from "../../assets/interface";
import { addDepartment, loadAllDepartments, removeDepartment, updateDepartment } from "./slice";
import { fetchRowsService } from "../../../core/apis/globalService";

const DepartmentUtills = () => {
    const endPoint: string = "departments"
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const dispatch = useDispatch<AppDispatch>()

    const fetchAllDepartments = async () => {
        setLoading(true)
        try {
            const response = await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint }) as IDepartmentsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllDepartments(response.data.content))
            }
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    const addDepartmentToStore = (department: IDepartment) => {
        dispatch(addDepartment(department))
    }

    const removeDepartmentFromStore = (department: IDepartment) => {
        dispatch(removeDepartment(department))
    }

    const updateDepartmentInStore = (department: IDepartment) => {
        dispatch(updateDepartment(department))
    }


    const formFields: Array<IFormData<IDepartment>> = [
        {
            value: "name",
            label: 'Department Name',
            type: "input"
        },
        {
            value: "headOfDepartment",
            label: "Head 0f Department",
            type: "autocomplete",
            options: []
        }
    ]

    return ({
        handleClose,
        handleOpen,
        setModalState,
        open,
        modalState,
        formFields,
        addDepartmentToStore,
        removeDepartmentFromStore,
        updateDepartmentInStore,
        fetchAllDepartments,
        loading
    })
}

export default DepartmentUtills
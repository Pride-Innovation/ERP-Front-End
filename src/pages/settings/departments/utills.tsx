/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { useSelector } from "react-redux";
import { IDepartment } from "./interface";
import { IFormData } from "../../assets/interface";
import { addDepartment, loadAllDepartments, removeDepartment, updateDepartment } from "./slice";
import { listDepartmentsService } from "./service";

const DepartmentUtills = () => {
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const dispatch = useDispatch<AppDispatch>()
    const { departments } = useSelector((state: RootState) => state.DepartmentStore);

    const fetchAllDepartments = async () => {
        const response = await listDepartmentsService() as Array<IDepartment>;
        dispatch(loadAllDepartments(response))
    }

    useEffect(() => { fetchAllDepartments() }, []);

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
            value: "head",
            label: "Manager",
            type: "select",
            options: [
                { label: "Manager One", value: 1 },
                { label: "Manager Two", value: 2 }
            ]
        },
        {
            value: "status",
            label: 'Unit Status',
            type: "select",
            options: [
                {
                    label: "Full Branch",
                    value: 1
                },
                {
                    label: "Minor Branch",
                    value: 2
                }
            ]
        },
        {
            value: "desc",
            label: 'Description',
            type: "textarea",
            required: false
        }]

    return ({
        departments,
        handleClose,
        handleOpen,
        setModalState,
        open,
        modalState,
        formFields,
        addDepartmentToStore,
        removeDepartmentFromStore,
        updateDepartmentInStore
    })
}

export default DepartmentUtills
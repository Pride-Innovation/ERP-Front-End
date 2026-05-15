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
import { IDepartment, IDepartmentsAxiosResponse } from "./interface";
import { IFormData } from "../../assets/interface";
import { addDepartment, loadAllDepartments, removeDepartment, setPaginationMeta, updateDepartment } from "./slice";
import { fetchRowsService } from "../../../core/apis/globalService";
import { IOptions } from "../../../components/tables/interface";

const DepartmentUtills = () => {
    const endPoint: string = "departments"
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setModalState("");
    };
    const dispatch = useDispatch<AppDispatch>();
    const { users } = useSelector((state: RootState) => state.UserStore);
    const { branches } = useSelector((state: RootState) => state.BranchStore);
    const [optionsObject, setOptionsObject] = useState<{
        usersOptions: Array<IOptions>,
        branchesOptions: Array<IOptions>

    }>({ usersOptions: [], branchesOptions: [] });

    const fetchAllDepartments = async ({
        pageNumber = 0,
        pageSize = 9,
        name,
    }: {
        pageNumber?: number;
        pageSize?: number;
        name?: string;
    } = {}) => {
        setLoading(true)
        try {
            const params: Record<string, any> = {};
            if (name) params.name = name;
            const response = await fetchRowsService({ pageNumber, pageSize, endPoint, params }) as IDepartmentsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllDepartments(response.data.content));
                dispatch(setPaginationMeta({
                    totalPages: response.data.totalPages,
                    totalElements: response.data.totalElements,
                }));
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

    useEffect(() => {
        if (users?.length > 0) {
            setOptionsObject({
                usersOptions: users?.map(user => ({ label: `${user.firstName} ${user.lastName}`, value: user.id as number })) || [],
                branchesOptions: branches?.map(branch => ({ label: branch.name, value: branch.id as number })) || []
            });
        }

    }, [users, branches]);


    const formFields: Array<IFormData<IDepartment>> = [
        {
            value: "name",
            label: 'Department Name',
            type: "input"
        },
        {
            value: "headOfDepartment",
            label: "Head of Department",
            type: "autocomplete",
            options: optionsObject.usersOptions
        },
        {
            value: "branch",
            label: "Branch",
            type: "autocomplete",
            options: optionsObject.branchesOptions
        },
        {
            value: "managersGroupEmail",
            label: "Managers Group Email",
            type: "input"
        },
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
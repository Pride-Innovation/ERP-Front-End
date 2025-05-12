/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react"
import { IFormData } from "../../assets/interface";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { addBranch, loadBranches, removeBranch, updateBranch } from "./slice";
import { IBranch, IBranchesAxiosResponse } from "./interface";
import { listBranchesService } from "./service";
import { useSelector } from "react-redux";
import { IOptions } from "../../../components/tables/interface";

const BranchUtills = () => {
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    const [optionsObject, setOptionsObject] = useState<{
        usersOptions: Array<IOptions>,
    }>({
        usersOptions: [],
    });
    const { users } = useSelector((state: RootState) => state.UserStore);

    const fetchAllBranches = async () => {
        setLoading(true)
        try {
            const response = await listBranchesService() as IBranchesAxiosResponse;
            if (response.status === 200) {
                dispatch(loadBranches(response?.data?.content))
            }
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    const filterAllUsers = async (value: string) => {
        console.log(value)
    }

    useEffect(() => {
        if (users?.length > 0) {
            setOptionsObject({
                usersOptions: users?.map(user => ({ label: `${user.firstName} ${user.lastName}`, value: user.id as number })) || [],
            });
        }

    }, [users])

    const filterByName = (text: string) => {
        /**
         * TO DO
         * Call an API to find a branch!!
         */
    }

    const addBranchToStore = (branch: IBranch) => {
        dispatch(addBranch(branch))
    }

    const removeBranchToStore = (branch: IBranch) => {
        dispatch(removeBranch(branch))
    }

    const updateBranchInStore = (branch: IBranch) => {
        dispatch(updateBranch(branch))
    }

    useEffect(() => { fetchAllBranches() }, []);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const formFields: Array<IFormData<IBranch>> = [
        {
            value: "name",
            label: 'Branch Name',
            type: "input"
        },
        {
            value: "email",
            label: 'Branch Email',
            type: "input"
        },
        {
            value: "telephone",
            label: 'Branch Telephone',
            type: "input"
        },
        {
            value: "branchManager",
            label: "Branch Manager",
            type: "autocomplete",
            options: optionsObject.usersOptions
        },
        {
            value: "branchOperationsManager",
            label: "Branch Operations Manager",
            type: "select",
            options: optionsObject.usersOptions
        },
        {
            value: "relationshipManager",
            label: "Relationship Manager",
            type: "select",
            options: optionsObject.usersOptions
        },
        {
            value: "creditAdministrator",
            label: "Credit Administrator",
            type: "select",
            options: optionsObject.usersOptions
        },
        {
            value: "region",
            label: "Region",
            type: "select",
            options: []
        },
        {
            value: "district",
            label: "District",
            type: "select",
            options: []
        }
    ]

    return (
        {
            filterByName,
            formFields,
            modalState,
            setModalState,
            open,
            handleClose,
            handleOpen,
            addBranchToStore,
            removeBranchToStore,
            updateBranchInStore,
            loading,
            fetchAllBranches,
            users,
            filterAllUsers
        }
    )
}

export default BranchUtills
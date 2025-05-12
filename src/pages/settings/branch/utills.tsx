/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from "react"
import { IFormData } from "../../assets/interface";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { addBranch, loadBranches, removeBranch, updateBranch } from "./slice";
import { IBranch, IBranchesAxiosResponse } from "./interface";
import { listBranchesService } from "./service";
import { useSelector } from "react-redux";
import { IOptions } from "../../../components/tables/interface";
import UserUtils from "../../users/utils";
import { AutocompleteContext } from "../../../context/autocomplete";

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
    const { value, inputValue } = useContext(AutocompleteContext)

    const { fetchAllUsers } = UserUtils()
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

    const filterAllUsers = async (text: string) => {
        if (value.length === 0) {
            // console.log(text, value, inputValue, "Varoius values")
            // const response = await fetchAllUsers({ first_name: text })
            // console.log(response, "Response data!!")
        }

    }

    useEffect(() => {
        if (users?.length > 0) {
            setOptionsObject({
                usersOptions: users?.map(user => ({ label: `${user.firstName} ${user.lastName}`, value: user.id as number })) || [],
            });
        }

    }, [users])

    const filterBranchByName = (text: string) => {
        /**
         * TO DO
         * Call an API to find a branch by name!!
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
            type: "autocomplete",
            options: optionsObject.usersOptions
        },
        {
            value: "relationshipManager",
            label: "Relationship Manager",
            type: "autocomplete",
            options: optionsObject.usersOptions
        },
        {
            value: "creditAdministrator",
            label: "Credit Administrator",
            type: "autocomplete",
            options: optionsObject.usersOptions
        },
        {
            value: "region",
            label: "Region",
            type: "input",
            // options: []
        },
        {
            value: "district",
            label: "District",
            type: "input",
            // options: []
        }
    ]

    return (
        {
            filterBranchByName,
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
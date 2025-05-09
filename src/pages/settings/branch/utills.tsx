/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react"
import { IFormData } from "../../assets/interface";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { addBranch, loadBranches, removeBranch, updateBranch } from "./slice";
import { IBranch } from "./interface";
import { listBranchesService } from "./service";

const BranchUtills = () => {
    const [branchList, setBranchList] = useState<IBranch[]>([] as Array<IBranch>);
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();

    const { branches } = useSelector((state: RootState) => state.BranchStore);

    const fetchAllBranches = async () => {
        const response = await listBranchesService() as Array<IBranch>;
        dispatch(loadBranches(response))
        setBranchList(response);
    }
    const filterByName = (text: string) => {
        const filteredBranches = branches.filter(branch => branch.name.toLowerCase().indexOf(text.toLowerCase()) !== -1);
        setBranchList(filteredBranches);
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
            value: "tel",
            label: 'Branch Telephone',
            type: "input"
        },
        {
            value: "status",
            label: 'Branch Status',
            type: "select",
            options: [
                {
                    label: "Full Branch",
                    value: 1
                },
                {
                    label: "Echo Branch",
                    value: 2
                }
            ]
        },
        {
            value: "desc",
            label: 'Description',
            type: "textarea"
        }]

    return (
        {
            branches,
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
            branchList
        }
    )
}

export default BranchUtills
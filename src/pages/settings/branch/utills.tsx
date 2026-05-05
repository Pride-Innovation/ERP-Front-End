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
import { useSelector } from "react-redux";
import { IOptions } from "../../../components/tables/interface";
import { fetchRowsService } from "../../../core/apis/globalService";
import RegionUtills from "../regions/utills";
import DistrictUtills from "../districts/utills";

const BranchUtills = () => {
    const endPoint: string = "branches"
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const dispatch = useDispatch<AppDispatch>();
    const { fetchAllRegions } = RegionUtills();
    const { fetchAllDistricts } = DistrictUtills();
    const [optionsObject, setOptionsObject] = useState<{
        usersOptions: Array<IOptions>,
        regionsOptions: Array<IOptions>,
        districtsOptions: Array<IOptions>,
    }>({
        usersOptions: [],
        regionsOptions: [],
        districtsOptions: [],
    });
    const { users } = useSelector((state: RootState) => state.UserStore);
    const { regions } = useSelector((state: RootState) => state.RegionStore);
    const { districts } = useSelector((state: RootState) => state.DistrictStore);

    const fetchAllBranches = async (params?: Record<string, any>, pageNumber = 0, pageSize = 10) => {
        setLoading(true)
        try {
            const response = await fetchRowsService({
                pageNumber,
                pageSize,
                endPoint,
                params
            }) as IBranchesAxiosResponse;
            if (response.status === 200) {
                dispatch(loadBranches(response?.data?.content))
                setTotalElements(response?.data?.totalElements ?? 0)
                setTotalPages(response?.data?.totalPages ?? 0)
            }
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    // Fetch regions and districts on mount if not already in store
    useEffect(() => {
        if (regions.length === 0) fetchAllRegions();
        if (districts.length === 0) fetchAllDistricts();
    }, []);

    useEffect(() => {
        setOptionsObject({
            usersOptions: users?.map(user => ({ label: `${user.firstName} ${user.lastName}`, value: user.id as number })) || [],
            regionsOptions: regions?.map(region => ({ label: region.name, value: region.id as number })) || [],
            districtsOptions: districts?.map(district => ({ label: district.name, value: district.id as number })) || [],
        });
    }, [users, regions, districts]);

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
            type: "select",
            options: optionsObject.regionsOptions
        },
        {
            value: "district",
            label: "District",
            type: "select",
            options: optionsObject.districtsOptions
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
            totalElements,
            totalPages,
            optionsObject,
        }
    )
}

export default BranchUtills
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { fetchRowsService } from "../../../core/apis/globalService";
import { ITitle, ITitlesAxiosResponse } from "./interface";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { addTitle, loadAllTitles, removeTitle, updateTitle, setPaginationMeta } from "./slice";
import { IFormData } from "../../assets/interface";
import { useSelector } from "react-redux";
import { IOptions } from "../../../components/tables/interface";
import { IRolesAxiosResponse } from "../../settings/interface";
import { loadAllRoles } from "../roles/slice";

const TitleUtills = () => {
    const endPoint: string = "titles";
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const dispatch = useDispatch<AppDispatch>();
    const { titles } = useSelector((state: RootState) => state.TitleStore);
    const { roles } = useSelector((state: RootState) => state.RoleStore)
    const [optionsObject, setOptionsObject] = useState<{
        titlesOptions: Array<IOptions>,
        roleOptions: Array<IOptions>,
    }>({
        titlesOptions: [],
        roleOptions: [],
    });

    const fetchAllTitles = async ({
        pageNumber = 0,
        pageSize = 10,
        name,
        roleId,
    }: {
        pageNumber?: number;
        pageSize?: number;
        name?: string;
        roleId?: number | string;
    } = {}) => {
        setLoading(true)
        try {
            const params: Record<string, any> = {};
            if (name) params.name = name;
            if (roleId) params.roleId = roleId;

            const response = await fetchRowsService({ pageNumber, pageSize, endPoint, params }) as ITitlesAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllTitles(response.data.content));
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

    useEffect(() => {
        if (titles?.length > 0) {
            setOptionsObject({
                titlesOptions: titles?.map(title => ({ label: title.name, value: title.id as number })) || [],
                roleOptions: roles?.map(role => ({ label: role.name, value: role.id as number })) || [],
            });
        }

    }, [titles, roles]);

    const fetchRolesForFilter = async () => {
        try {
            const response = await fetchRowsService({ pageNumber: 0, pageSize: 1000, endPoint: "roles" }) as IRolesAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllRoles(response.data.content));
            }
        } catch (error) {
            console.log(error);
        }
    }

    const addTitleToStore = (title: ITitle) => {
        dispatch(addTitle(title))
    }

    const updateTitleInStore = (title: ITitle) => {
        dispatch(updateTitle(title))
    }

    const removeTitleFromStore = (title: ITitle) => {
        dispatch(removeTitle(title))
    }

    const formFields: Array<IFormData<ITitle>> = [
        {
            value: "name",
            label: 'Title Name',
            type: "input"
        },
        {
            value: "reportsTo",
            label: 'Reports To',
            type: "select",
            options: optionsObject.titlesOptions
        },
        {
            value: "role",
            label: "Role",
            type: "select",
            options: optionsObject.roleOptions
        }
    ]

    return ({
        modalState,
        setModalState,
        open,
        setOpen,
        loading,
        setLoading,
        handleClose,
        handleOpen,
        fetchAllTitles,
        fetchRolesForFilter,
        formFields,
        addTitleToStore,
        updateTitleInStore,
        removeTitleFromStore
    })
}

export default TitleUtills;
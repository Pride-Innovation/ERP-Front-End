/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useDispatch } from "react-redux";
import { fetchRowsService } from "../../../core/apis/globalService";
import { IRegion, IRegionsAxiosResponse } from "./interface";
import { AppDispatch } from "../../../store";
import { loadAllRegions, setPaginationMeta, addRegion, updateRegion, removeRegion } from "./slice";
import { useState } from "react";

const RegionUtills = () => {
    const endPoint = "regions";
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setModalState("");
    };
    const dispatch = useDispatch<AppDispatch>();

    const fetchAllRegions = async ({
        pageNumber = 0,
        pageSize = 9,
        name,
    }: {
        pageNumber?: number;
        pageSize?: number;
        name?: string;
    } = {}) => {
        setLoading(true);
        try {
            const params: Record<string, any> = {};
            if (name) params.name = name;
            const response = await fetchRowsService({
                pageNumber,
                pageSize,
                endPoint,
                params
            }) as IRegionsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllRegions(response.data.content));
                dispatch(setPaginationMeta({
                    totalPages: response.data.totalPages,
                    totalElements: response.data.totalElements,
                }));
            }
        } catch (error) {
            console.error('Error fetching regions:', error);
        }
        setLoading(false);
    };

    const addRegionToStore = (region: IRegion) => {
        dispatch(addRegion(region));
    };

    const updateRegionInStore = (region: IRegion) => {
        dispatch(updateRegion(region));
    };

    const removeRegionFromStore = (region: IRegion) => {
        dispatch(removeRegion(region));
    };

    return {
        fetchAllRegions,
        modalState,
        setModalState,
        open,
        loading,
        handleClose,
        handleOpen,
        addRegionToStore,
        updateRegionInStore,
        removeRegionFromStore
    };
};

export default RegionUtills;
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
import { loadAllRegions, addRegion, updateRegion, removeRegion } from "./slice";
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

    const fetchAllRegions = async () => {
        setLoading(true);
        try {
            const response = await fetchRowsService({ 
                pageNumber: 0, 
                pageSize: 100, 
                endPoint 
            }) as IRegionsAxiosResponse;
            
            if (response.status === 200) {
                dispatch(loadAllRegions(response.data.content));
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
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { fetchRowsService } from "../../../core/apis/globalService";
import { IAssetType, IAssetTypesAxiosResponse } from "./interface";
import {
    addAssetType,
    loadAllAssetTypes,
    removeAssetType,
    setPaginationMeta,
    updateAssetType,
} from "./slice";

const AssetTypeUtills = () => {
    const endPoint: string = "asset-types";
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setModalState("");
    };

    const fetchAllAssetTypes = async ({
        pageNumber = 0,
        pageSize = 50,
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
                params,
            }) as IAssetTypesAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllAssetTypes(response.data.content));
                dispatch(setPaginationMeta({
                    totalPages: response.data.totalPages,
                    totalElements: response.data.totalElements,
                }));
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    const addAssetTypeToStore = (assetType: IAssetType) => {
        dispatch(addAssetType(assetType));
    };

    const updateAssetTypeInStore = (assetType: IAssetType) => {
        dispatch(updateAssetType(assetType));
    };

    const removeAssetTypeFromStore = (assetType: IAssetType) => {
        dispatch(removeAssetType(assetType));
    };

    return {
        endPoint,
        modalState,
        setModalState,
        open,
        loading,
        handleOpen,
        handleClose,
        fetchAllAssetTypes,
        addAssetTypeToStore,
        updateAssetTypeInStore,
        removeAssetTypeFromStore,
    };
};

export default AssetTypeUtills;

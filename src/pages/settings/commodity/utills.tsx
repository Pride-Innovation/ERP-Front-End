/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import { useEffect, useState } from "react";
import { ICommoditiesAxiosResponse, ICommodity } from "./interface";
import { IFormData } from "../../assets/interface";
import { fetchRowsService } from "../../../core/apis/globalService";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { addCommodity, deleteCommodity, loadAllCommodities, setPaginationMeta, updateCommodity } from "./slice";
import AssetTypeUtills from "../assetTypes/utills";
import { IOptions } from "../../../components/tables/interface";
import { useSelector } from "react-redux";

const CommodityUtills = () => {
    const endPoint: string = "commodities";
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore)
    const { fetchAllAssetTypes } = AssetTypeUtills();
    const [optionsObject, setOptionsObject] = useState<{
        assetTypesOptions: Array<IOptions>
    }>({
        assetTypesOptions: []
    });

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    useEffect(() => { fetchAllAssetTypes() }, []);

    const fetchAllCommodities = async ({
        pageNumber = 0,
        pageSize = 9,
        name,
        groupName,
        assetTypeId,
    }: {
        pageNumber?: number;
        pageSize?: number;
        name?: string;
        groupName?: string;
        assetTypeId?: string | number | null;
    } = {}) => {
        setLoading(true);
        try {
            const params: Record<string, any> = {};
            if (name) params.name = name;
            if (groupName) params.groupName = groupName;
            if (assetTypeId) params.assetTypeId = assetTypeId;
            const response = await fetchRowsService({
                pageNumber,
                pageSize,
                endPoint,
                params
            }) as ICommoditiesAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllCommodities(response.data.content));
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

    const addCommodityToStore = (commodity: ICommodity) => {
        dispatch(addCommodity(commodity))
    }


    const updateCommodityInStore = (commodity: ICommodity) => {
        dispatch(updateCommodity(commodity))
    }

    const removeCommodityFromStore = (commodity: ICommodity) => {
        dispatch(deleteCommodity(commodity))
    }

    useEffect(() => {
        if (assetTypes?.length > 0) {
            setOptionsObject({
                assetTypesOptions: assetTypes?.map(assetType => ({ label: assetType.name, value: assetType.id as number })) || []
            });
        }

    }, [assetTypes])

    const formFields: Array<IFormData<ICommodity>> = [
        {
            value: "name",
            label: 'Commodity Name',
            type: "input"
        },
        {
            value: "groupName",
            label: 'Unit of Measure',
            type: "input"
        },
        {
            value: "assetType",
            label: "Asset Type",
            type: "select",
            options: optionsObject.assetTypesOptions
        }
    ]
    return ({
        handleClose,
        handleOpen,
        modalState,
        open,
        loading,
        setModalState,
        setLoading,
        addCommodityToStore,
        formFields,
        fetchAllCommodities,
        updateCommodityInStore,
        removeCommodityFromStore
    })
}

export default CommodityUtills;
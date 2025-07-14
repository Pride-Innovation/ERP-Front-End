/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid } from "@mui/material"
import ModalComponent from "../../../components/modal"
import Dispose from "../Dispose"
import TableComponent from "../../../components/tables/TableComponent"
import ITEquipmentUtills from "./utills"
import { useNavigate } from "react-router"
import { useContext, useEffect, useState } from "react"
import { ROUTES } from "../../../core/routes/routes"
import { ErrorMessage } from "../../../core/apis/axiosInstance"
import { fetchRowsService } from "../../../core/apis/globalService"
import { IITEquipmentsAxiosResponse } from "./interface"
import { useDispatch } from "react-redux"
import { AppDispatch, RootState } from "../../../store"
import { loadAllITAssets } from "./slice"
import { useSelector } from "react-redux"
import AssetUtills from "../Utills"
import { AssetContext } from "../../../context/asset"

const ITEquipment = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { itAssets } = useSelector((state: RootState) => state.ITAssetStore)
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { setItEquipmentCount, itEquipmentCount } = useContext(AssetContext);
    const { currentAssetType, setCurrentAssetType } = AssetUtills()
    const {
        open,
        handleClose,
        endPoint,
        header,
        columnHeaders,
        module,
        handleOptionClicked,
        currentAsset,
        handleRequest,
        iTEquipmentTableData,
        determineITAssetType
    } = ITEquipmentUtills();

    const fetchResources = async () => {
        setLoading(true)
        const params = { assetTypeId: currentAssetType.id }

        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 10,
                endPoint,
                params
            }) as IITEquipmentsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllITAssets(response.data.content));
                setItEquipmentCount(response.data.totalElements)
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ErrorMessage;
            console.log(errorMessage)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (assetTypes.length > 0) {
            const assetType = determineITAssetType()
            setCurrentAssetType(assetType);
        }
    }, [assetTypes]);

    useEffect(() => {
        if (currentAssetType.id) {
            fetchResources()
        }
    }, [currentAssetType])


    useEffect(() => {
        if (itAssets.length > 0) {
            handleRequest(itAssets)
        }
    }, [itAssets])


    return (
        <>
            {
                <ModalComponent width={"40%"} title='Dispose IT Equipment' open={open} handleClose={handleClose}>
                    <Dispose
                        handleClickAction={handleOptionClicked}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                    />
                </ModalComponent>
            }
            <Grid xs={12} container>
                <TableComponent
                    endPoint={endPoint}
                    loading={loading}
                    count={itEquipmentCount}
                    exportData
                    createAction
                    importData
                    header={header}
                    module={module}
                    rows={iTEquipmentTableData || []}
                    columnHeaders={columnHeaders}
                    onCreationHandler={() => navigate(ROUTES.CREATE_ITEQUIPMENT)}
                    handleOptionClicked={handleOptionClicked}
                    params={{ assetTypeId: currentAssetType.id }}
                    refresh
                    filterMode="server"
                />
            </Grid>
        </>
    )
}

export default ITEquipment;
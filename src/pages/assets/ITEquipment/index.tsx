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
import { IBulkAssetData, IITEquipmentsAxiosResponse } from "./interface"
import { useDispatch } from "react-redux"
import { AppDispatch, RootState } from "../../../store"
import { loadAllITAssets } from "./slice"
import { useSelector } from "react-redux"
import AssetUtills from "../Utills"
import { AssetContext } from "../../../context/asset"
import { assetTypesStatusConstants, crudStates } from "../../../utils/constants"
import Repair from "../Repair"
import Reassign from "../Reassign"
import ToStore from "../ToStore"
import { FileContext } from "../../../context/file/FileContext"
import { toast } from "react-toastify"
import { bulkInsertITAssetsService } from "./service"

const ITEquipment = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { itAssets } = useSelector((state: RootState) => state.ITAssetStore)
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { setItEquipmentCount, itEquipmentCount } = useContext(AssetContext);
    const { currentAssetType, setCurrentAssetType } = AssetUtills()
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const { fileData } = useContext(FileContext);

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
        determineITAssetType,
        currentState,
    } = ITEquipmentUtills();

    const fetchResources = async (status?: string) => {
        setLoading(true);
        const params = {
            assetTypeId: currentAssetType.id,
            assetStatusId: status === 'requireUpdate' ? 9 :
                status === 'issuanceAvailable' ? 8 :
                    status === 'receiptAcknowledged' ? 7 :
                        status === 'inStore' ? 12 :
                            status === 'inMaintenance' ? 13 :
                                null
        }

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
            handleRequest(itAssets);
        }
    }, [itAssets])

    const handleStatusChange = (status: string) => {
        if (status === 'requireUpdate'
            || status === 'issuanceAvailable'
            || status === 'receiptAcknowledged'
            || status === 'inStore'
            || status === 'inMaintenance'
        ) {
            fetchResources(status);
            setSelectedStatus(status);
        } else {
            fetchResources('all');
            setSelectedStatus('all');
        }
    }

    const bulkInsertITAssets = async (assets: Array<IBulkAssetData>) => {
        try {
            const data = new FormData();
            data.append("assets", JSON.stringify(assets));
            data.append("assetTypeID", String(2)); // IT Equipment asset Type ID

            const response = await bulkInsertITAssetsService(data);

            if (response.success === true) {
                toast.success("Bulk Insert Successful")
                fetchResources('all');
            }

        } catch (error) {
            console.log("Bulk Insert Error", error);
        }
    }

    useEffect(() => {
        if (fileData?.jsonData?.length > 0 && fileData?.module === module) {
            bulkInsertITAssets(fileData.jsonData as unknown as Array<IBulkAssetData>);
        }
    }, [fileData]);

    return (
        <>
            {
                crudStates.dispose === currentState
                && <ModalComponent width={"40%"} title='Dispose IT Equipment' open={open} handleClose={handleClose}>
                    <Dispose
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                        module={assetTypesStatusConstants.itEquipment}
                    />
                </ModalComponent>
            }
            {
                crudStates.reassign === currentState
                && <ModalComponent width={"40%"} title='Reassign IT Equipment' open={open} handleClose={handleClose}>
                    <Reassign
                        handleClickAction={handleOptionClicked}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                        module={assetTypesStatusConstants.itEquipment}
                    />
                </ModalComponent>
            }

            {
                crudStates.repair === currentState
                && <ModalComponent width={"90%"} title='Repair IT Equipment' open={open} handleClose={handleClose}>
                    <Repair
                        handleClickAction={handleOptionClicked}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                        module={assetTypesStatusConstants.itEquipment}
                    />
                </ModalComponent>
            }

            {
                crudStates.inStore === currentState
                && <ModalComponent width={"40%"} title='Send IT Equipment to Store' open={open} handleClose={handleClose}>
                    <ToStore
                        handleClickAction={handleOptionClicked}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                        module={assetTypesStatusConstants.itEquipment}
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
                    status
                    onStatusChange={handleStatusChange}
                    selectedStatus={selectedStatus}
                />
            </Grid>
        </>
    )
}

export default ITEquipment;
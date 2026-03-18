/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box } from "@mui/material";

import { useContext, useEffect, useState } from "react";
import TableComponent from "../../../components/tables/TableComponent";
import { useNavigate } from "react-router";
import FleetUtills from "./utills";
import { ROUTES } from "../../../core/routes/routes";
import { IFleetsAxiosResponse } from "./interface";
import ModalComponent from "../../../components/modal";
import { fetchRowsService } from "../../../core/apis/globalService";
import AssetUtills from "../Utills";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { loadAllFleet } from "./slice";
import { useSelector } from "react-redux";
import { IBulkAssetData } from "../ITEquipment/interface";
import { toast } from "react-toastify";
import { bulkInsertFleetService } from "./service";
import { FileContext } from "../../../context/file/FileContext";
import { assetTypesStatusConstants, crudStates } from "../../../utils/constants";
import Dispose from "../Dispose";
import Reassign from "../Reassign";
import Repair from "../Repair";
import ToStore from "../ToStore";
import { FormContext } from "../../../context/form";
import dayjs from "dayjs";

const Fleet = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [count, setCount] = useState<number>(0)
    const navigate = useNavigate();
    const { currentAssetType, setCurrentAssetType, determineStatusId } = AssetUtills();
    const dispatch = useDispatch<AppDispatch>()
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { fleetAssets } = useSelector((state: RootState) => state.FleetStore);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const { fileData } = useContext(FileContext);
    const { tableStartDate, tableEndDate } = useContext(FormContext);


    const {
        columnHeaders,
        header,
        endPoint,
        open,
        handleClose,
        handleOptionClicked,
        handleFleetTableData,
        fleetTableData,
        module,
        determineFleetAssetType,
        currentState,
        currentAsset
    } = FleetUtills();

    const fetchResources = async (status?: string) => {
        setLoading(true);
        const params = {
            assetTypeId: currentAssetType.id,
            assetStatusId: determineStatusId(status || 'all'),
            startDate: tableStartDate ? dayjs(tableStartDate).format('YYYY-MM-DDTHH:mm:ss') : '',
            endDate: tableEndDate ? dayjs(tableEndDate).format('YYYY-MM-DDTHH:mm:ss') : ''
        }

        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 10,
                endPoint,
                params
            }) as IFleetsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllFleet(response.data.content));
                setCount(response.data.totalElements)
            }
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (assetTypes.length > 0) {
            const assetType = determineFleetAssetType()
            setCurrentAssetType(assetType);
        }
    }, [assetTypes]);

    useEffect(() => {
        if (currentAssetType.id) {
            fetchResources()
        }
    }, [currentAssetType])


    useEffect(() => {
        if (fleetAssets.length > 0) {
            handleFleetTableData(fleetAssets)
        }
    }, [fleetAssets])

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

            const response = await bulkInsertFleetService(data);

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


    useEffect(() => {
        if (tableStartDate && tableEndDate) {
            fetchResources()
        }
    }, [tableStartDate, tableEndDate]);

    const renderModals = () => (
        <>
            {
                crudStates.dispose === currentState
                && <ModalComponent width={"40%"} title='Dispose Fleet' open={open} handleClose={handleClose}>
                    <Dispose
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                        module={assetTypesStatusConstants.fleet}
                    />
                </ModalComponent>
            }
            {
                crudStates.reassign === currentState
                && <ModalComponent width={"40%"} title='Reassign Fleet' open={open} handleClose={handleClose}>
                    <Reassign
                        handleClickAction={handleOptionClicked}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                        module={assetTypesStatusConstants.fleet}
                    />
                </ModalComponent>
            }

            {
                crudStates.repair === currentState
                && <ModalComponent width={"90%"} title='Repair Fleet' open={open} handleClose={handleClose}>
                    <Repair
                        handleClickAction={handleOptionClicked}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                        module={assetTypesStatusConstants.fleet}
                    />
                </ModalComponent>
            }

            {
                crudStates.inStore === currentState
                && <ModalComponent width={"40%"} title='Send Fleet to Store' open={open} handleClose={handleClose}>
                    <ToStore
                        handleClickAction={handleOptionClicked}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                        module={assetTypesStatusConstants.fleet}
                    />
                </ModalComponent>
            }
        </>
    )


    return (
        <Box width={'100%'} sx={{
            px: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {renderModals()}

            {columnHeaders.length > 0 &&
                <TableComponent
                    endPoint={endPoint}
                    loading={loading}
                    count={count}
                    exportData
                    createAction
                    module={module}
                    importData
                    header={header}
                    rows={fleetTableData || []}
                    columnHeaders={columnHeaders}
                    onCreationHandler={() => navigate(ROUTES.CREATE_FLEET)}
                    handleOptionClicked={handleOptionClicked}
                    paginationMode='server'
                    params={{ assetTypeId: currentAssetType.id }}
                    refresh
                    filterMode="server"
                    status
                    onStatusChange={handleStatusChange}
                    selectedStatus={selectedStatus}
                    dateRangePicker
                    filterOptions
                />
            }
        </Box>
    )
}

export default Fleet
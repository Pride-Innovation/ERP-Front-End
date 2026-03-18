/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    useContext,
    useEffect,
    useState
} from "react";
import { useNavigate } from "react-router";
import { Box, Card } from "@mui/material";

import OfficeEquipmentUtills from "./utills";
import TableComponent from "../../../components/tables/TableComponent";
import { ROUTES } from "../../../core/routes/routes";
import ModalComponent from "../../../components/modal";
import Dispose from "../Dispose";
import { fetchRowsService } from "../../../core/apis/globalService";
import AssetUtills from "../Utills";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { IOfficeEquipmentsAxiosResponse, IOfficeEquipmentTableData } from "./interface";
import { loadAllOfficeAssets } from "./slice";
import { useSelector } from "react-redux";
import { AssetContext } from "../../../context/asset";
import { assetTypesStatusConstants, crudStates } from "../../../utils/constants";
import Reassign from "../Reassign";
import Repair from "../Repair";
import ToStore from "../ToStore";
import { IBulkAssetData } from "../ITEquipment/interface";
import { toast } from "react-toastify";
import { FileContext } from "../../../context/file/FileContext";
import { bulkInsertOfficeAssetsService } from "./service";
import { FormContext } from "../../../context/form";
import dayjs from "dayjs";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

const OfficeEquipment = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { currentAssetType, setCurrentAssetType, determineStatusId } = AssetUtills();
    const dispatch = useDispatch<AppDispatch>();
    const { officeEquipmentCount, setOfficeEquipmentCount } = useContext(AssetContext);
    const { officeAsset } = useSelector((state: RootState) => state.OfficeAssetStore)
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const { fileData } = useContext(FileContext);
    const { tableStartDate, tableEndDate } = useContext(FormContext);
    const { setOptions } = useContext(AssetContext);

    const {
        columnHeaders,
        header,
        endPoint,
        handleOptionClicked,
        handleClose,
        open,
        module,
        currentAsset,
        handleOfficeEquipmentTableData,
        officeEquipmentTableData,
        determineOfficeAssetType,
        currentState
    } = OfficeEquipmentUtills();

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
            }) as IOfficeEquipmentsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllOfficeAssets(response.data.content));
                setOfficeEquipmentCount(response.data.totalElements);
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }

    useEffect(() => {
        if (assetTypes.length > 0) {
            const assetType = determineOfficeAssetType()
            setCurrentAssetType(assetType);
        }
    }, [assetTypes]);

    useEffect(() => {
        if (currentAssetType.id) {
            fetchResources()
        }
    }, [currentAssetType])


    useEffect(() => {
        if (officeAsset.length > 0) {
            handleOfficeEquipmentTableData(officeAsset)
        }
    }, [officeAsset])

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
            data.append("assetTypeID", String(1)); // Office Equipment asset Type ID

            const response = await bulkInsertOfficeAssetsService(data);

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

    const handleOptionChanged = (data: IOfficeEquipmentTableData[]) => {
        // This function can be used to handle any additional logic when options change
        const options = [
            { value: crudStates.dispose, label: "Dispose", icon: <InfoIcon fontSize='small' color='error' /> },
            { value: crudStates.update, label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
            { value: crudStates.read, label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' color='inherit' /> },
            { value: crudStates.reassign, label: "Reassign", icon: <AssignmentIndOutlinedIcon fontSize='small' color='secondary' /> },
            { value: crudStates.repair, label: "Repair", icon: <BuildOutlinedIcon fontSize='small' color='primary' /> },
            { value: crudStates.inStore, label: "Send to Store", icon: <HomeOutlinedIcon fontSize='small' color='action' /> },
        ]

        setOptions(options);
    }


    useEffect(() => {
        if (officeEquipmentTableData?.length > 0) {
            handleOptionChanged(officeEquipmentTableData || [])
        }
    }, [officeEquipmentTableData]);
    const renderModals = () => (
        <>
            {
                crudStates.dispose === currentState
                && <ModalComponent width={"40%"} title='Dispose Office Equipment' open={open} handleClose={handleClose}>
                    <Dispose
                        handleClickAction={handleOptionClicked}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                        module={assetTypesStatusConstants.officeEquipment}
                    />
                </ModalComponent>
            }
            {
                crudStates.reassign === currentState
                && <ModalComponent width={"40%"} title='Reassign Office Equipment' open={open} handleClose={handleClose}>
                    <Reassign
                        handleClickAction={handleOptionClicked}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                        module={assetTypesStatusConstants.officeEquipment}
                    />
                </ModalComponent>
            }

            {
                crudStates.repair === currentState
                && <ModalComponent width={"90%"} title='Repair Office Equipment' open={open} handleClose={handleClose}>
                    <Repair
                        handleClickAction={handleOptionClicked}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                        module={assetTypesStatusConstants.officeEquipment}
                    />
                </ModalComponent>
            }

            {
                crudStates.inStore === currentState
                && <ModalComponent width={"40%"} title='Send Office Equipment to Store' open={open} handleClose={handleClose}>
                    <ToStore
                        handleClickAction={handleOptionClicked}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                        module={assetTypesStatusConstants.officeEquipment}
                    />
                </ModalComponent>
            }
        </>)

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
                    count={officeEquipmentCount}
                    exportData
                    createAction
                    importData
                    header={header}
                    module={module}
                    rows={officeEquipmentTableData || []}
                    columnHeaders={columnHeaders}
                    onCreationHandler={() => navigate(ROUTES.CREATE_OFFICE_EQUIPMENT)}
                    handleOptionClicked={handleOptionClicked}
                    paginationMode='server'
                    params={{
                        assetTypeId: currentAssetType.id
                    }}
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

export default OfficeEquipment;
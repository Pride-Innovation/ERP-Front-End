import {
    useContext,
    useEffect,
    useState
} from "react";
import { useNavigate, useParams } from "react-router";
import { Box } from "@mui/material";

import GeneralAssetUtills from "./utills";
import TableComponent from "../../../components/tables/TableComponent";
import { ROUTES } from "../../../core/routes/routes";
import ModalComponent from "../../../components/modal";
import Dispose from "../Dispose";
import { fetchRowsService } from "../../../core/apis/globalService";
import AssetUtills from "../Utills";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { IOfficeEquipmentsAxiosResponse } from "../officeEquipment/interface";
import { loadAllGeneralAssets } from "./slice";
import { useSelector } from "react-redux";
import { crudStates } from "../../../utils/constants";
import Reassign from "../Reassign";
import Repair from "../Repair";
import ToStore from "../ToStore";
import { FormContext } from "../../../context/form";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { AssetContext } from "../../../context/asset";
import { PERMISSIONS } from "../../../core/permissions/constants";

const GeneralAssets = () => {
    const { typeId } = useParams<{ typeId: string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const [assetCount, setAssetCount] = useState<number>(0);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const navigate = useNavigate();
    const { currentAssetType, setCurrentAssetType } = AssetUtills();
    const dispatch = useDispatch<AppDispatch>();
    const { generalAssets } = useSelector((state: RootState) => state.GeneralAssetStore);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { tableStartDate, tableEndDate } = useContext(FormContext);
    const { setOptions } = useContext(AssetContext);

    const {
        columnHeaders,
        endPoint,
        handleOptionClicked,
        handleClose,
        open,
        module,
        currentAsset,
        handleGeneralAssetTableData,
        generalAssetTableData,
        currentState
    } = GeneralAssetUtills(typeId || "");

    const fetchResources = async (status?: string, extraParams?: Record<string, any>) => {
        setLoading(true);
        const dateRange = extraParams?.createdAt;
        const params = {
            assetTypeId: currentAssetType.id,
            ...(status && status !== 'all' ? { status } : {}),
            ...(dateRange ? { createdAt: dateRange } : (tableStartDate && tableEndDate ? { createdAt: `${tableStartDate},${tableEndDate}` } : {})),
            ...(extraParams ? { ...extraParams, createdAt: undefined } : {})
        };

        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 50,
                endPoint,
                params
            }) as IOfficeEquipmentsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllGeneralAssets(response.data.content));
                setAssetCount(response.data.totalElements);
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    // Find and set the current asset type from URL param
    useEffect(() => {
        if (assetTypes.length > 0 && typeId) {
            const assetType = assetTypes.find(t => String(t.id) === typeId);
            if (assetType) {
                setCurrentAssetType(assetType);
            }
        }
    }, [assetTypes, typeId]);

    useEffect(() => {
        if (currentAssetType.id) {
            fetchResources();
        }
    }, [currentAssetType]);

    useEffect(() => {
        if (generalAssets.length > 0) {
            handleGeneralAssetTableData(generalAssets);
        }
    }, [generalAssets]);

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
    };

    const handleOptionChanged = () => {
        const options = [
            { value: crudStates.dispose, label: "Dispose", icon: <InfoIcon fontSize='small' color='error' /> },
            { value: crudStates.update, label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
            { value: crudStates.read, label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' color='inherit' /> },
            { value: crudStates.reassign, label: "Reassign", icon: <AssignmentIndOutlinedIcon fontSize='small' color='secondary' /> },
            { value: crudStates.repair, label: "Repair", icon: <BuildOutlinedIcon fontSize='small' color='primary' /> },
            { value: crudStates.inStore, label: "Send to Store", icon: <HomeOutlinedIcon fontSize='small' color='action' /> },
        ];
        setOptions(options);
    };

    useEffect(() => {
        handleOptionChanged();
    }, []);

    useEffect(() => {
        if (tableStartDate && tableEndDate) {
            fetchResources();
        }
    }, [tableStartDate, tableEndDate]);

    const assetType = assetTypes.find(t => String(t.id) === typeId);
    const header = { plural: assetType?.name || 'Assets', singular: assetType?.name || 'Asset' };

    const renderModals = () => (
        <>
            {crudStates.dispose === currentState
                && <ModalComponent width={"40%"} title={`Dispose ${assetType?.name || 'Asset'}`} open={open} handleClose={handleClose}>
                    <Dispose
                        handleClickAction={handleOptionClicked}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                        module={assetType?.name || ''}
                    />
                </ModalComponent>
            }
            {crudStates.reassign === currentState
                && <ModalComponent width={"40%"} title={`Reassign ${assetType?.name || 'Asset'}`} open={open} handleClose={handleClose}>
                    <Reassign
                        handleClickAction={handleOptionClicked}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                        module={assetType?.name || ''}
                    />
                </ModalComponent>
            }
            {crudStates.repair === currentState
                && <ModalComponent width={"90%"} title={`Repair ${assetType?.name || 'Asset'}`} open={open} handleClose={handleClose}>
                    <Repair
                        handleClickAction={handleOptionClicked}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                        module={assetType?.name || ''}
                    />
                </ModalComponent>
            }
            {crudStates.inStore === currentState
                && <ModalComponent width={"40%"} title={`Send ${assetType?.name || 'Asset'} to Store`} open={open} handleClose={handleClose}>
                    <ToStore
                        handleClickAction={handleOptionClicked}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                        module={assetType?.name || ''}
                    />
                </ModalComponent>
            }
        </>
    );

    return (
        <Box width={'100%'} sx={{ display: 'flex', flexDirection: 'column' }}>
            {renderModals()}

            {columnHeaders.length > 0 &&
                <TableComponent
                    endPoint={endPoint}
                    loading={loading}
                    count={assetCount}
                    exportData
                    createAction
                    createPermission={PERMISSIONS.CREATE_ASSET}
                    importData
                    header={header}
                    module={module}
                    rows={generalAssetTableData || []}
                    columnHeaders={columnHeaders}
                    onCreationHandler={() => navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${typeId}/create`)}
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
                    columnFilters={[
                        { key: 'assetName', label: 'Asset Name', type: 'text' },
                        { key: 'engravedNo', label: 'Engraved No', type: 'text' },
                        { key: 'location', label: 'Location', type: 'text' },
                        { key: 'assignedTo', label: 'Assigned To', type: 'text' },
                        {
                            key: 'status', label: 'Status', type: 'select', options: [
                                { value: 'active', label: 'Active' },
                                { value: 'disabled', label: 'Disabled' },
                                { value: 'locked', label: 'Locked' },
                            ]
                        },
                        { key: 'createdAt', label: 'Date Received', type: 'dateRange' },
                    ]}
                    onApplyFilters={(filters) => fetchResources(selectedStatus, filters)}
                />
            }
        </Box>
    );
};

export default GeneralAssets;

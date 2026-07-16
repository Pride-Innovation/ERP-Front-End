import {
    useContext,
    useEffect,
    useState
} from "react";
import { useNavigate, useParams } from "react-router";
import { alpha, Box, Chip, Paper, Stack, Typography } from "@mui/material";
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';

import GeneralAssetUtills from "./utills";
import TableComponent from "../../../components/tables/TableComponent";
import { ROUTES } from "../../../core/routes/routes";
import ModalComponent from "../../../components/modal";
import Dispose from "../Dispose";
import { fetchRowsService } from "../../../core/apis/globalService";
import AssetUtills from "../Utills";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { IOfficeEquipmentsAxiosResponse } from "../interface";
import { loadAllGeneralAssets } from "./slice";
import { useSelector } from "react-redux";
import { crudStates } from "../../../utils/constants";
import Reassign from "../Reassign";
import Repair from "../Repair";
import ToStore from "../ToStore";
import TogglePool from "../TogglePool";
import { FormContext } from "../../../context/form";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { AssetContext } from "../../../context/asset";
import { PERMISSIONS } from "../../../core/permissions/constants";
import StatusUtills from "../../settings/statuses/Utills";

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
    const { statuses } = useSelector((state: RootState) => state.StatusesStore);
    const { fetchAllStatuses } = StatusUtills();

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
        // "Due for disposal" is a derived state, not a stored status — send it as its own flag
        // rather than a `status` filter the backend wouldn't recognise.
        const isDueForDisposal = status === 'dueForDisposal';
        const params = {
            assetTypeId: currentAssetType.id,
            ...(isDueForDisposal ? { dueForDisposal: true } : (status && status !== 'all' ? { status } : {})),
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

    // When the category in the URL changes, immediately clear the previously-loaded
    // assets so a slow (or empty) fetch for the new category can't leave stale rows
    // from the old one on screen.
    useEffect(() => {
        dispatch(loadAllGeneralAssets([]));
        setSelectedStatus('all');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeId]);

    useEffect(() => {
        if (currentAssetType.id) {
            fetchResources();
        }
    }, [currentAssetType]);

    // Rebuild the table rows whenever the loaded assets change — including when the
    // new category returns an empty list, so a previous category's rows never linger.
    useEffect(() => {
        handleGeneralAssetTableData(generalAssets);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generalAssets]);

    const handleStatusChange = (status: string) => {
        if (status === 'requireUpdate'
            || status === 'issuanceAvailable'
            || status === 'receiptAcknowledged'
            || status === 'inStore'
            || status === 'inMaintenance'
            || status === 'dueForDisposal'
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
            { value: crudStates.read, label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' />, divider: true },
            { value: crudStates.update, label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
            { value: crudStates.reassign, label: "Reassign", icon: <AssignmentIndOutlinedIcon fontSize='small' color='secondary' /> },
            { value: crudStates.repair, label: "Repair", icon: <BuildOutlinedIcon fontSize='small' color='primary' /> },
            { value: crudStates.inStore, label: "Send to Store", icon: <HomeOutlinedIcon fontSize='small' color='action' /> },
            { value: crudStates.temporaryPool, label: "Temporary Pool", icon: <Inventory2OutlinedIcon fontSize='small' sx={{ color: '#B45309' }} /> },
            { value: crudStates.dispose, label: "Dispose", icon: <InfoIcon fontSize='small' color='error' /> },
        ];
        setOptions(options);
    };

    useEffect(() => {
        handleOptionChanged();
    }, []);

    // Statuses power the status filter (resolved by code).
    useEffect(() => {
        if (!statuses.length) fetchAllStatuses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (tableStartDate && tableEndDate) {
            fetchResources();
        }
    }, [tableStartDate, tableEndDate]);

    const assetType = assetTypes.find(t => String(t.id) === typeId);
    const header = { plural: assetType?.name || 'Assets', singular: assetType?.name || 'Asset' };

    const PRIMARY = '#08796C';

    // Category facts shown as chips in the summary strip — only the configured ones.
    const categoryFacts: string[] = [];
    if (assetType?.depreciationRate != null) categoryFacts.push(`Depreciation ${assetType.depreciationRate}% / yr`);
    if (assetType?.usefulLifeMonths) categoryFacts.push(`Useful life ${assetType.usefulLifeMonths} months`);
    if (assetType?.repairable === false) {
        categoryFacts.push('Non-repairable — faults go to disposal');
    } else if (assetType?.repairDestination) {
        categoryFacts.push(`Repairs → ${assetType.repairDestination === 'IT' ? 'IT Store'
            : assetType.repairDestination === 'ADMIN' ? 'Admin Store' : 'External Consultant'}`);
    }

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
            {crudStates.temporaryPool === currentState
                && <ModalComponent width={"40%"} title={`Temporary Replacement Pool — ${assetType?.name || 'Asset'}`} open={open} handleClose={handleClose}>
                    <TogglePool
                        handleClickAction={handleOptionClicked}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText={currentAsset.temporaryPool ? 'Remove from Pool' : 'Mark as Pool Stock'}
                        asset={currentAsset}
                        module={assetType?.name || ''}
                    />
                </ModalComponent>
            }
        </>
    );

    // Consumable categories (tracksAssets off) have no asset register — stocking them only
    // updates store balances. Guard direct URLs with a pointer to the right page.
    if (assetType && assetType.tracksAssets !== true) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    borderRadius: '12px',
                    border: '1px solid #E6EAF0',
                    bgcolor: '#fff',
                    textAlign: 'center',
                    boxShadow: 'hsla(220, 30%, 5%, 0.04) 0px 4px 10px 0px',
                }}
            >
                <Box
                    sx={{
                        width: 52, height: 52, borderRadius: '14px', mx: 'auto', mb: 2,
                        bgcolor: alpha(PRIMARY, 0.07), color: PRIMARY,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <CategoryOutlinedIcon sx={{ fontSize: 26 }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                    {assetType.name} is a consumable category
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 460, mx: 'auto' }}>
                    Items in this category don't create individual asset records — their stock is
                    tracked as balances on the <strong>Store</strong> pages. To track each unit as a
                    serialized asset, enable <em>"Stocking creates serialized asset records"</em> for
                    this category under Settings → Asset Categories.
                </Typography>
            </Paper>
        );
    }

    return (
        <Box width={'100%'} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {renderModals()}

            {/* ── Category summary strip — the auth card's identity-header idiom ── */}
            {assetType && (
                <Paper
                    elevation={0}
                    sx={{
                        px: 2.5,
                        py: 1.75,
                        borderRadius: '12px',
                        border: '1px solid #E6EAF0',
                        bgcolor: '#fff',
                        boxShadow: 'hsla(220, 30%, 5%, 0.04) 0px 4px 10px 0px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.75,
                        flexWrap: 'wrap',
                    }}
                >
                    <Box
                        sx={{
                            width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                            bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY,
                            border: `1px solid ${alpha(PRIMARY, 0.16)}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <CategoryOutlinedIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
                            {assetType.name}
                        </Typography>
                        {assetType.description && (
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                                {assetType.description}
                            </Typography>
                        )}
                    </Box>
                    {categoryFacts.length > 0 && (
                        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, flexShrink: 0 }}>
                            {categoryFacts.map((fact) => (
                                <Chip
                                    key={fact}
                                    label={fact}
                                    size="small"
                                    sx={{
                                        height: 22, fontSize: '0.68rem', fontWeight: 600,
                                        bgcolor: alpha(PRIMARY, 0.06), color: PRIMARY,
                                        border: `1px solid ${alpha(PRIMARY, 0.14)}`,
                                        '& .MuiChip-label': { px: 1 },
                                    }}
                                />
                            ))}
                        </Stack>
                    )}
                </Paper>
            )}

            {/* ── Asset table, carded like the auth pages — edge-to-edge, no inner padding ── */}
            {columnHeaders.length > 0 &&
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '12px',
                        border: '1px solid #E6EAF0',
                        bgcolor: '#fff',
                        overflow: 'hidden',
                        boxShadow:
                            'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
                    }}
                >
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
                </Paper>
            }
        </Box>
    );
};

export default GeneralAssets;

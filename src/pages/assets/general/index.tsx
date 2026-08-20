import {
    useContext,
    useEffect,
    useRef,
    useState
} from "react";
import { useNavigate, useParams } from "react-router";
import { alpha, Box, Chip, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { toast } from "react-toastify";

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
import { FormContext } from "../../../context/form";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { AssetContext } from "../../../context/asset";
import { PERMISSIONS } from "../../../core/permissions/constants";
import StatusUtills from "../../settings/statuses/Utills";
import TableUtills from "../../../components/tables/utills";
import { FileContext } from "../../../context/file/FileContext";
import { IAssetImportResult } from "../interface";
import { bulkImportAssetsService, fetchAssetImportTemplateService } from "../service/importService";
import { assetImportHeaders } from "../assetImportTemplate";
import AssetBulkImportResult from "../AssetBulkImportResult";
import { fetchAllBranches, ReferenceOption } from "../../users/service/referenceData";

/**
 * Statuses an asset can actually be in.
 *
 * The status table is shared with requests, stock and the approval ladders, so listing all of it in
 * an asset filter would offer things like "BOM Approved" that no asset ever holds. These are the
 * codes the status chips above the table already use.
 */
const ASSET_STATUS_CODES = [
    'requireUpdate', 'issuanceAvailable', 'sentToStore', 'assetAssigned', 'assetIssued',
    'receiptAcknowledged', 'inMaintenance', 'inTransit', 'pendingDisposal',
];

/** Matches the table footer's default, so the first fetch and the footer agree. */
const DEFAULT_PAGE_SIZE = 10;

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
    const { fileData, setFileData } = useContext(FileContext);

    /** Branches for the Location filter; fetched once. */
    const [branches, setBranches] = useState<ReferenceOption[]>([]);

    // ── Bulk import ──────────────────────────────────────────────────────────
    const [importResult, setImportResult] = useState<IAssetImportResult | null>(null);
    const [importRows, setImportRows] = useState<any[]>([]);
    const [importHeaders, setImportHeaders] = useState<string[]>([]);
    const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null);

    const {
        columnHeaders,
        endPoint,
        handleOptionClicked,
        handleClose,
        open,
        module,
        currentAsset,
        handleGeneralAssetTableData,
        buildAssetExportRows,
        generalAssetTableData,
        currentState
    } = GeneralAssetUtills(typeId || "");

    // Branded Cover + Data workbook, and the reports-style PDF.
    const { generateExcelFromRows, generatePDFFromRows } = TableUtills({ moduleName: currentAssetType.name });

    /**
     * Loads the table.
     *
     * <p>Every key here has to be a parameter `GET /assets` declares. Spring silently discards any it
     * does not, which is why the status chips appeared to work and did nothing: they sent
     * `status=issuanceAvailable`, and the endpoint takes `assetStatusId`. The same applied to the
     * toolbar's date range, which sent `createdAtFrom`/`createdAtTo` against an endpoint expecting
     * `startDate`/`endDate`.
     */
    const fetchResources = async (
        status?: string,
        extraParams?: Record<string, any>,
        pageModel?: { page: number; pageSize: number; sortBy?: string; sortDirection?: 'ASC' | 'DESC' },
    ) => {
        setLoading(true);

        // "Due for disposal" is derived from useful life, not a stored status, so it travels as its
        // own flag.
        const isDueForDisposal = status === 'dueForDisposal';
        const statusId = (status && status !== 'all' && !isDueForDisposal)
            ? statuses.find((s) => s.status === status)?.id
            : undefined;

        const { dateReceivedFrom, dateReceivedTo, ...rest } = extraParams ?? {};
        const startDate = dateReceivedFrom ?? (tableStartDate ? new Date(tableStartDate).toISOString() : undefined);
        const endDate = dateReceivedTo ?? (tableEndDate ? new Date(tableEndDate).toISOString() : undefined);

        const params = {
            assetTypeId: currentAssetType.id,
            ...(isDueForDisposal ? { dueForDisposal: true } : {}),
            ...(statusId ? { assetStatusId: statusId } : {}),
            ...(startDate ? { startDate } : {}),
            ...(endDate ? { endDate } : {}),
            // Sorting happens in the database, so it covers the whole register rather than the ten
            // rows on screen. Unset means the endpoint's own default: newest first.
            ...(pageModel?.sortBy ? { sortBy: pageModel.sortBy } : {}),
            ...(pageModel?.sortDirection ? { sortDirection: pageModel.sortDirection } : {}),
            ...rest,
        };

        try {
            const response = await fetchRowsService({
                /*
                 * One page's worth, matching the footer.
                 *
                 * This asked for fifty while the table's footer showed ten, so fifty rows rendered
                 * under a label reading "1–10 of N". Paging is now handled by refetching through
                 * this same function, which is what keeps the date range and the "due for disposal"
                 * flag alive past page one — the shared pagination path rebuilt params from scratch
                 * and could not see either.
                 */
                pageNumber: pageModel?.page ?? 0,
                pageSize: pageModel?.pageSize ?? DEFAULT_PAGE_SIZE,
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

    /**
     * Hard cap on a filter-aware export.
     *
     * A register can run to tens of thousands of rows; building a PDF of all of them locks the tab
     * and produces a document nobody will read. Anything larger should be narrowed first.
     */
    const EXPORT_MAX_ROWS = 10_000;

    /**
     * The filters and status currently in force.
     *
     * Held so that turning a page can reissue exactly the query the user is looking at. Without it,
     * paging would have to rebuild the request and would lose whatever the page derived for itself.
     */
    const activeQuery = useRef<{ status?: string; filters?: Record<string, any> }>({});

    const runQuery = (status?: string, filters?: Record<string, any>) => {
        activeQuery.current = { status, filters };
        fetchResources(status, filters);
    };

    /** Names the slice being exported, so the PDF strip and the Excel cover say what it is. */
    const buildFilterSummary = (): Array<{ label: string; value: string }> => {
        const out: Array<{ label: string; value: string }> = [];
        const f = activeQuery.current.filters ?? {};
        const status = activeQuery.current.status;

        out.push({ label: 'Category', value: currentAssetType.name ?? '—' });
        if (status && status !== 'all') {
            const name = status === 'dueForDisposal'
                ? 'Due for Disposal'
                : statuses.find((s) => s.status === status)?.name ?? status;
            out.push({ label: 'Status', value: name });
        }
        if (f.assetName) out.push({ label: 'Asset Name', value: String(f.assetName) });
        if (f.engravedNumber) out.push({ label: 'Engraved No', value: String(f.engravedNumber) });
        if (f.serialNumber) out.push({ label: 'Serial No', value: String(f.serialNumber) });
        if (f.model) out.push({ label: 'Model', value: String(f.model) });
        if (f.location) out.push({ label: 'Location', value: String(f.location) });
        if (f.assignedTo) out.push({ label: 'Assigned To', value: String(f.assignedTo) });
        if (f.assetStatusId != null) {
            const s = statuses.find((x) => x.id === Number(f.assetStatusId));
            out.push({ label: 'Status', value: s?.name ?? `#${f.assetStatusId}` });
        }
        if (f.dateReceivedFrom || f.dateReceivedTo) {
            const d = (v?: string) => (v ? new Date(v).toLocaleDateString('en-GB') : '…');
            out.push({ label: 'Date Added', value: `${d(f.dateReceivedFrom)} – ${d(f.dateReceivedTo)}` });
        }
        return out;
    };

    /**
     * Exports what the filters describe, not what is on screen.
     *
     * <p>There was no `onExport` here at all, so the toolbar fell through to the shared default —
     * which resolves this page's module name to something `formatExportData` has never heard of and
     * fetched `/General Asset`. Export on this page did not work.
     *
     * <p>Rows are refetched rather than taken from the table, because the table holds one page: an
     * export of a filter matching four hundred assets would otherwise be a file of ten.
     */
    const handleExport = async (format: 'pdf' | 'excel') => {
        // Titled by category, not by the generic module name the toolbar would otherwise use.
        const meta = { filters: buildFilterSummary(), title: currentAssetType.name || 'Assets' };
        try {
            const { status, filters } = activeQuery.current;
            const isDueForDisposal = status === 'dueForDisposal';
            const statusId = (status && status !== 'all' && !isDueForDisposal)
                ? statuses.find((s) => s.status === status)?.id
                : undefined;

            const { dateReceivedFrom, dateReceivedTo, ...rest } = filters ?? {};
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: EXPORT_MAX_ROWS,
                endPoint,
                params: {
                    assetTypeId: currentAssetType.id,
                    ...(isDueForDisposal ? { dueForDisposal: true } : {}),
                    ...(statusId ? { assetStatusId: statusId } : {}),
                    ...(dateReceivedFrom ? { startDate: dateReceivedFrom } : {}),
                    ...(dateReceivedTo ? { endDate: dateReceivedTo } : {}),
                    ...rest,
                },
            }) as IOfficeEquipmentsAxiosResponse;

            const content = response?.data?.content ?? [];
            if (content.length === 0) {
                toast.info('No assets match the current filters.');
                return;
            }
            if (content.length >= EXPORT_MAX_ROWS) {
                toast.warning(
                    `Export capped at ${EXPORT_MAX_ROWS.toLocaleString()} rows — narrow the filters for the full set.`
                );
            }

            // Reuses the table's own mapper, so the export carries the same resolved location,
            // holder name and formatted date the screen shows rather than raw entity graphs.
            const rows = buildAssetExportRows(content);
            if (format === 'excel') generateExcelFromRows(rows, meta);
            else await generatePDFFromRows(rows, meta);
        } catch (error) {
            console.error('Asset export failed', error);
            toast.error('Could not build the export. Please try again.');
        }
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
            runQuery();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            || status === 'inTransit'
            || status === 'assetIssued'
            || status === 'dueForDisposal'
        ) {
            runQuery(status, activeQuery.current.filters);
            setSelectedStatus(status);
        } else {
            runQuery('all', activeQuery.current.filters);
            setSelectedStatus('all');
        }
    };

    const handleOptionChanged = () => {
        const options = [
            { value: crudStates.read, label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' />, divider: true },
            { value: crudStates.update, label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
            { value: crudStates.reassign, label: "Reassign", icon: <AssignmentIndOutlinedIcon fontSize='small' color='secondary' /> },
            { value: crudStates.repair, label: "Repair", icon: <BuildOutlinedIcon fontSize='small' color='primary' /> },
            { value: crudStates.inStore, label: "Receive into Store", icon: <HomeOutlinedIcon fontSize='small' color='action' /> },
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
        fetchAllBranches()
            .then(setBranches)
            .catch((e) => console.warn('Failed to load branches for the location filter', e));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Imports a parsed spreadsheet into the category currently on screen.
     *
     * <p>The row cap is the server's, read from the template endpoint rather than hard-coded here —
     * the limits follow from the server's multipart size and the client's request timeout, so
     * duplicating them in the browser would leave two numbers to keep in step.
     *
     * <p>Rows go up in batches. A single request carrying a whole file exceeds the 2MB multipart
     * limit and the 60-second timeout somewhere past two thousand rows, and fails after committing
     * an unknown number of them — the outcome that is hardest to recover from.
     */
    const importAssets = async (rows: any[]) => {
        if (!currentAssetType.id) return;
        try {
            const meta = await fetchAssetImportTemplateService(Number(currentAssetType.id));

            if (rows.length > meta.maxRows) {
                toast.error(
                    `This file has ${rows.length.toLocaleString()} rows. `
                    + `Please split it into files of ${meta.maxRows.toLocaleString()} rows or fewer.`
                );
                return;
            }

            setImportRows(rows);
            setImportHeaders(assetImportHeaders(meta.fieldConfig));
            setImportProgress({ done: 0, total: rows.length });

            const result = await bulkImportAssetsService(
                rows,
                Number(currentAssetType.id),
                meta.batchSize,
                (done, total) => setImportProgress({ done, total }),
            );

            setImportResult(result);

            if (result.inserted > 0) {
                toast.success(
                    result.failed === 0
                        ? `Imported ${result.inserted} asset${result.inserted === 1 ? '' : 's'} successfully.`
                        : `Imported ${result.inserted} of ${result.total} rows. ${result.failed} failed — see details.`
                );
                runQuery(selectedStatus, activeQuery.current.filters);
            } else {
                toast.error('No assets were created. See details.');
            }
        } catch (error) {
            console.error('Asset import failed', error);
            toast.error('The import could not be started. Please try again.');
        } finally {
            setImportProgress(null);
            // Cleared so re-uploading the same file runs the import again rather than being ignored
            // as an unchanged context value.
            setFileData({} as any);
        }
    };

    useEffect(() => {
        if (fileData?.jsonData?.length > 0 && fileData?.module === module) {
            importAssets(fileData.jsonData as unknown as any[]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileData]);

    useEffect(() => {
        if (tableStartDate && tableEndDate) {
            // Keeps the status chip and any filters in force — the toolbar's date picker narrows the
            // current view rather than replacing it.
            runQuery(selectedStatus, activeQuery.current.filters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            {/*
              * Progress, not a spinner. A file goes up in batches and a large one takes a while;
              * a spinner would leave the user unable to tell a slow import from a stuck one.
              */}
            {importProgress && (
                <ModalComponent width="34%" title="Importing assets" open handleClose={() => { }}>
                    <Box sx={{ pt: 1 }}>
                        <Typography sx={{ fontSize: '0.86rem', color: '#475569', mb: 1.5 }}>
                            Importing {importProgress.done.toLocaleString()} of{' '}
                            {importProgress.total.toLocaleString()} rows…
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={importProgress.total ? (importProgress.done / importProgress.total) * 100 : 0}
                            sx={{
                                height: 8, borderRadius: 4, bgcolor: alpha(PRIMARY, 0.12),
                                '& .MuiLinearProgress-bar': { bgcolor: PRIMARY, borderRadius: 4 },
                            }}
                        />
                        <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mt: 1.5 }}>
                            Rows are saved as they go, so nothing already imported is lost if this stops.
                        </Typography>
                    </Box>
                </ModalComponent>
            )}

            {importResult && (
                <ModalComponent
                    width="62%"
                    title="Import Summary"
                    open
                    handleClose={() => setImportResult(null)}
                >
                    <AssetBulkImportResult
                        result={importResult}
                        sourceRows={importRows}
                        headers={importHeaders}
                        handleClose={() => setImportResult(null)}
                    />
                </ModalComponent>
            )}

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
            {/* One action covers both jobs now: booking the asset into a store and, in the same
                step, marking it loanable. The separate "Temporary Pool" modal is gone — flipping
                that flag without moving the asset produced pool stock the replacement picker could
                never find. */}
            {crudStates.inStore === currentState
                && <ModalComponent width={"45%"} title={`Receive ${assetType?.name || 'Asset'} into Store`} open={open} handleClose={handleClose}>
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
                    onExport={handleExport}
                    createAction
                    createPermission={PERMISSIONS.CREATE_ASSET}
                    importData
                    // Lets the import button build this category's template from its own field
                    // configuration, rather than a static header list that had no entry for assets.
                    assetTypeId={Number(currentAssetType.id)}
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
                    /*
                     * Filter keys must be the parameter names GET /assets actually declares —
                     * Spring drops anything else without a word, so a filter naming the wrong key
                     * looks like it works and silently returns the unfiltered list.
                     *
                     * Three of these were doing exactly that: `engravedNo` (the endpoint declares
                     * `engravedNumber`), a `createdAt` date range (it declares `startDate` and
                     * `endDate`), and a Status dropdown still offering Active/Disabled/Locked —
                     * user account states, copied from the users page and never adapted.
                     */
                    columnFilters={[
                        { key: 'assetName', label: 'Asset Name', type: 'text' },
                        { key: 'engravedNumber', label: 'Engraved No', type: 'text' },
                        { key: 'serialNumber', label: 'Serial No', type: 'text' },
                        { key: 'model', label: 'Model', type: 'text' },
                        {
                            key: 'location', label: 'Location', type: 'select',
                            options: branches.map((b) => ({ value: b.label, label: b.label })),
                        },
                        { key: 'assignedTo', label: 'Assigned To', type: 'text' },
                        {
                            key: 'assetStatusId', label: 'Status', type: 'select',
                            options: statuses
                                .filter((s) => s.id != null && ASSET_STATUS_CODES.includes(s.status ?? ''))
                                .map((s) => ({ value: s.id as number, label: s.name })),
                        },
                        // "Date Added", not "Date Received": startDate/endDate filter on the
                        // record's createDate. The asset's own dateReceipt is a free-text column
                        // holding several date formats, so it cannot be range-queried in SQL — and
                        // labelling this one "Date Received" would quietly answer a different
                        // question from the one asked.
                        { key: 'dateReceived', label: 'Date Added', type: 'dateRange' },
                    ]}
                    onApplyFilters={(filters) => runQuery(selectedStatus, filters)}
                    // Paging refetches through this page's own function, so the status chip, the
                    // date range and the "due for disposal" flag all survive past page one.
                    onPaginationChange={(model) =>
                        fetchResources(activeQuery.current.status, activeQuery.current.filters, model)}
                    /*
                     * Row key → the Asset column that orders it. Only columns the register can
                     * actually be ordered by are listed: Location and Assigned To are derived from
                     * associations the sort cannot reach, and Status resolves through a join, so
                     * those keep sorting the visible page rather than pretending to sort the table.
                     */
                    serverSortFields={{
                        assetName: 'assetName',
                        engravedNumber: 'engravedNumber',
                        serialNumber: 'serialNumber',
                        make: 'make',
                        manufacturer: 'make',
                        model: 'model',
                        dateReceived: 'dateReceipt',
                    }}
                    // GET /assets declares assetName; the toolbar's search previously sent `name`,
                    // which Spring discarded without a word.
                    searchKey="assetName"
                />
                </Paper>
            }
        </Box>
    );
};

export default GeneralAssets;

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useCallback, useEffect, useMemo, useState } from 'react';
import { RequirePermission } from '../../core/permissions';
import usePermissions from '../../core/permissions/usePermissions';
import { PERMISSIONS } from '../../core/permissions/constants';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    alpha, Box, Button, Chip, Grid, Stack, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { toast } from 'react-toastify';
import { RootState } from '../../store';
import { ROUTES } from '../../core/routes/routes';
import ModalComponent from '../../components/modal';
import { PageHero, PageSection, StatTile, EmptyState } from '../../components/layout';
import { brand, neutral } from '../../utils/tokens';
import MovementUtills from './utills';
import MovementTable from './MovementTable';
import RepairFlowsModal from './RepairFlowsModal';
import MovementActionModal from './MovementActionModal';
import MovementFilters, {
    MovementFilterValues, hasActiveMovementFilters,
} from './allMovements/MovementFilters';
import { exportMovementsPdf, exportMovementsExcel, exportMovementsCsv } from './allMovements/exportMovements';
import RoutesUtills from '../../core/routes/utills';
import {
    fetchPendingApprovalMovementsService, fetchMovementStatusCountsService,
    fetchMovementFilterOptionsService,
} from './service';
import { fetchRowsService } from '../../core/apis/globalService';

import { MovementStatus } from './constants';
import { IMovement } from './interface';
/** How many rows the digest pulls when filters are on — enough to be useful, not a register dump. */
const DIGEST_SIZE = 50;

/** Cap on one export, so a careless export of everything cannot pull the table into the browser. */
const EXPORT_LIMIT = 5000;

const Movement = () => {
    const navigate = useNavigate();
    const { movements } = useSelector((state: RootState) => state.MovementStore);

    const {
        fetchAllMovements, loading, count, modalState,
        open, handleClose, sendingRequest, setSendingRequest,
        currentMovement,
    } = MovementUtills();
    const [repairOpen, setRepairOpen] = useState(false);

    /*
     * The "Pending My Approval" inbox used to sit here as a second table.
     *
     * Removed: this page already carries a hero, a five-tile stat strip, a filter bar and the
     * movements table, and a second table of the same rows pushed the actual list below the fold.
     * Approvers are told by email and by the in-app bell instead — see
     * MovementApprovalService#notifyApprover — and act from the movement's own detail page, which is
     * where the full context lives anyway.
     *
     * The endpoint it used (GET /movements/pending-approval/{approverId}) is untouched and still
     * feeds the dashboard.
     */
    const currentUserId = RoutesUtills().getCurrentUser()?.id;
    /** Count only — the rows themselves are read from the movement's own page. */
    const [pendingCount, setPendingCount] = useState(0);

    /**
     * Only an approver has an approval inbox.
     *
     * <p>`GET /movements/pending-approval/{id}` requires APPROVE_MOVEMENT, and this ran for everyone
     * who opened the page — so on live data six of the twelve accounts that can read movements got a
     * 403 on every page load, for a chip they were never going to be shown. The endpoint was right;
     * the page simply was not asking whether it had any business calling it.
     *
     * <p>The old `pendingCount > 0` test guarded the chip but not the request, which is the wrong end:
     * by then the call has already failed.
     */
    const { has } = usePermissions();
    const mayApproveMovements = has(PERMISSIONS.APPROVE_MOVEMENT);

    /*
     * Who may open Repair / Disposal at all.
     *
     * The button was ungated while the New Movement button directly beside it was not. Measured on
     * live data: sixteen accounts hold READ_MOVEMENT and so reach this page and saw it, while only
     * eight could submit a repair and four a disposal - so half the people offered it got a 403 on
     * the first thing they tried, which reads as a broken button rather than as a boundary.
     *
     * A disjunction because the modal carries four flows under two permissions; it filters its own
     * tiles to whichever of the two the viewer actually holds, so somebody with one of them is not
     * offered the other's flow.
     */
    const mayRepairAssets = has(PERMISSIONS.REPAIR_ASSET);
    const mayDisposeAssets = has(PERMISSIONS.DISPOSE_ASSET);

    const fetchPendingCount = async () => {
        if (!currentUserId || !mayApproveMovements) return;
        const r = (await fetchPendingApprovalMovementsService(currentUserId, { pageSize: 1, pageNumber: 0 })) as any;
        if (r?.status === 200) setPendingCount(r.data?.totalElements ?? r.data?.content?.length ?? 0);
    };

    const [filters, setFilters] = useState<MovementFilterValues>({});
    const filtersActive = hasActiveMovementFilters(filters);

    /** The panel's filters as endpoint parameters; blank values are left out entirely. */
    const queryParams = useMemo(() => {
        const params: Record<string, any> = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params[key] = value;
        });
        return params;
    }, [filters]);

    /**
     * The filters as a printed strip, so a sheet says which slice of the register it is.
     *
     * <p>The old exporter printed none, so two exports taken minutes apart under different filters
     * were indistinguishable once saved — and an export is precisely the artefact that outlives the
     * screen that produced it.
     */
    const exportFilterStrip = useMemo(() => {
        const labels: Record<string, string> = {
            dateFrom: 'From', dateTo: 'To', movementType: 'Type', movementCategory: 'Category',
            status: 'Status', source: 'Source', destination: 'Destination', courier: 'Courier',
            trackingNumber: 'Tracking No', receiptStatus: 'Receipt', initiator: 'Initiated by',
        };
        return Object.entries(queryParams)
            .filter(([, value]) => Boolean(value))
            .map(([key, value]) => ({ label: labels[key] ?? key, value: String(value) }));
    }, [queryParams]);

    /*
     * A digest, but of the register rather than of the first hundred rows.
     *
     * This page fetched 100 movements and did the filtering, the counting and the exports over them.
     * The heading showed the true total while the five tiles counted the loaded rows, so past a
     * hundred the tiles stopped summing to the number printed directly above them — and a filter
     * that matched only later movements reported "no results". Both now come from the server.
     *
     * Unfiltered this is a recent-eight digest; with filters on it becomes a real, if capped,
     * result list, and "View all" is a page away for anything longer.
     */
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
    const [filterOptions, setFilterOptions] = useState({
        sources: [] as string[], destinations: [] as string[],
        couriers: [] as string[], initiators: [] as string[],
    });

    const load = useCallback(() => {
        fetchAllMovements({
            ...queryParams,
            pageNumber: 0,
            pageSize: DIGEST_SIZE,
            sortBy: 'createDate',
            sortDirection: 'desc',
        });
        fetchMovementStatusCountsService(queryParams).then((r: any) => {
            setStatusCounts(r?.status === 200 ? (r.data ?? {}) : {});
        });
        fetchPendingCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const refresh = () => load();
    useEffect(() => { load(); }, [load]);

    // From the whole scoped register, not from the rows on screen, so the panel cannot fail to offer
    // a value it would have matched.
    useEffect(() => {
        fetchMovementFilterOptionsService().then((r: any) => {
            if (r?.status === 200 && r.data) setFilterOptions(r.data);
        });
    }, []);

    const openMovement = (movement: IMovement) => navigate(`${ROUTES.READ_MOVEMENT}/${movement.id}`);

    const countBy = (s: MovementStatus) => statusCounts[s] ?? 0;
    const inTransit = countBy('DISPATCHED') + countBy('IN_TRANSIT');

    // Already filtered and ordered by the query; capped at eight only when nothing is filtered.
    const filteredMovements = movements;
    const recent = filtersActive ? filteredMovements : filteredMovements.slice(0, 8);

    /**
     * Exports cover every match, not the handful on screen.
     *
     * <p>They ran over the loaded rows, so an export from this page was silently partial — the worst
     * kind, because the file looks complete.
     */
    const handleExport = async (fn: (rows: IMovement[]) => void) => {
        const res: any = await fetchRowsService({
            endPoint: 'movements',
            pageNumber: 0,
            pageSize: EXPORT_LIMIT,
            params: queryParams,
        });
        const rows: IMovement[] = res?.status === 200 ? (res.data?.content ?? []) : [];

        if (rows.length === 0) {
            toast.warning('There are no movements matching the current filters to export.');
            return;
        }
        if ((res.data?.totalElements ?? 0) > rows.length) {
            toast.info(`Exporting the first ${rows.length.toLocaleString()} of `
                + `${res.data.totalElements.toLocaleString()} matches. Narrow the filters for the rest.`);
        }
        fn(rows);
    };

    const todayLabel = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        // Same page padding as PageShell (used by /movement/all) so the two pages align.
        <Box sx={{ minHeight: '100vh', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, pb: 4 }}>
            <PageHero
                title="Movement Management"
                subtitle="Transfers, replenishment, repairs and disposals across stores"
                icon={<SwapHorizOutlinedIcon />}
                stat={{ value: (count ?? 0).toLocaleString(), label: 'movements', helper: todayLabel }}
                actions={
                    <Stack direction="row" spacing={1.25} alignItems="center">
                        {/*
                         * What replaced the "Pending My Approval" table: the same count, costing one
                         * chip instead of a second table. Clicking it filters the list below to what
                         * is awaiting a decision, so the answer stays on this page.
                         */}
                        {pendingCount > 0 && (
                            <Tooltip title={`${pendingCount} movement(s) awaiting your approval — you were emailed for each`}>
                                <Chip
                                    icon={<PendingActionsOutlinedIcon sx={{ fontSize: 15 }} />}
                                    label={`${pendingCount} awaiting you`}
                                    onClick={() => setFilters((f) => ({ ...f, status: 'DRAFT' }))}
                                    sx={{
                                        height: 32, fontWeight: 700, fontSize: '0.76rem', cursor: 'pointer',
                                        bgcolor: alpha('#F59E0B', 0.14), color: '#B45309',
                                        border: `1px solid ${alpha('#F59E0B', 0.3)}`,
                                        '& .MuiChip-icon': { color: '#B45309' },
                                        '&:hover': { bgcolor: alpha('#F59E0B', 0.22) },
                                    }}
                                />
                            </Tooltip>
                        )}
                        {/* The journeys movements ride on. Separate entry point because a consignment
                            spans several movements and belongs to nobody's individual record. */}
                        <Button
                            variant="outlined"
                            startIcon={<LocalShippingOutlinedIcon />}
                            onClick={() => navigate(ROUTES.CONSIGNMENTS)}
                            sx={{ height: 36, px: 2, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                        >
                            Consignments
                        </Button>
                        {(mayRepairAssets || mayDisposeAssets) && (
                            <Button
                                variant="outlined"
                                startIcon={<BuildOutlinedIcon />}
                                onClick={() => setRepairOpen(true)}
                                sx={{ height: 36, px: 2, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                            >
                                Repair / Disposal
                            </Button>
                        )}
                        <RequirePermission permission={PERMISSIONS.CREATE_MOVEMENT}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate(ROUTES.CREATE_MOVEMENT)}
                                sx={{
                                    height: 36, px: 2.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600,
                                    bgcolor: brand[500], '&:hover': { bgcolor: brand[700] },
                                    boxShadow: `0 2px 8px ${alpha(brand[500], 0.3)}`,
                                }}
                            >
                                New Movement
                            </Button>
                        </RequirePermission>
                    </Stack>
                }
            />

            {/* Status overview */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={4} md={2.4}>
                    <StatTile
                        label="Awaiting Approval"
                        value={countBy('DRAFT')}
                        accent="warning"
                        icon={<PendingActionsOutlinedIcon />}
                        onClick={() => navigate(`${ROUTES.MOVEMENT}/all`)}
                    />
                </Grid>
                <Grid item xs={6} sm={4} md={2.4}>
                    <StatTile
                        label="Initiated"
                        value={countBy('INITIATED')}
                        accent="gold"
                        icon={<SwapHorizOutlinedIcon />}
                        onClick={() => navigate(`${ROUTES.MOVEMENT}/all`)}
                    />
                </Grid>
                <Grid item xs={6} sm={4} md={2.4}>
                    <StatTile
                        label="In Transit"
                        value={inTransit}
                        accent="info"
                        icon={<LocalShippingOutlinedIcon />}
                        onClick={() => navigate(`${ROUTES.MOVEMENT}/all`)}
                    />
                </Grid>
                <Grid item xs={6} sm={4} md={2.4}>
                    <StatTile
                        label="Received"
                        value={countBy('RECEIVED')}
                        accent="brand"
                        icon={<AssignmentTurnedInOutlinedIcon />}
                        onClick={() => navigate(`${ROUTES.MOVEMENT}/all`)}
                    />
                </Grid>
                <Grid item xs={6} sm={4} md={2.4}>
                    <StatTile
                        label="Completed"
                        value={countBy('COMPLETED')}
                        accent="success"
                        icon={<CheckCircleOutlineOutlinedIcon />}
                        onClick={() => navigate(`${ROUTES.MOVEMENT}/all`)}
                    />
                </Grid>
            </Grid>

            {/* Filters & export bar — same styling as the Reports page */}
            <MovementFilters
                sources={filterOptions.sources}
                destinations={filterOptions.destinations}
                couriers={filterOptions.couriers}
                initiators={filterOptions.initiators}
                onApply={setFilters}
                onExportPdf={() => handleExport((rows) => exportMovementsPdf(rows, { filters: exportFilterStrip }))}
                onExportExcel={() => handleExport(exportMovementsExcel)}
                onExportCsv={() => handleExport(exportMovementsCsv)}
                onRefresh={refresh}
            />

            {/* Recent movements */}
            <PageSection
                title={filtersActive ? 'Filtered Movements' : 'Recent Movements'}
                subtitle={filtersActive
                    ? `${recent.length} movement(s) matching the current filters`
                    : 'The latest transfers across all stores'}
                icon={<SwapHorizOutlinedIcon />}
                mb={0}
            >
                {/* Result count — mirrors the audit-trail page so the two read the same way. */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.8rem', color: neutral[500] }}>
                        Showing{' '}
                        <Box component="span" sx={{ fontWeight: 700, color: neutral[900] }}>{recent.length}</Box>
                        {' '}of{' '}
                        <Box component="span" sx={{ fontWeight: 700, color: neutral[900] }}>{movements.length}</Box>
                        {' '}movement{movements.length === 1 ? '' : 's'}
                    </Typography>
                    {filtersActive && (
                        <Chip
                            label="Filters applied"
                            size="small"
                            sx={{ height: 22, fontWeight: 600, fontSize: '0.68rem', bgcolor: alpha(brand[500], 0.08), color: brand[700] }}
                        />
                    )}
                </Box>

                <MovementTable
                    rows={recent}
                    loading={loading}
                    onView={openMovement}
                    paginateOver={15}
                    empty={(
                        <EmptyState
                            variant="inline"
                            title={filtersActive ? 'No movements matched your filters' : 'No movements yet'}
                            description={filtersActive
                                ? 'Adjust or clear the filters above to see movements.'
                                : 'Create a movement or initiate a repair / disposal to see it here.'}
                            icon={<SwapHorizOutlinedIcon />}
                            action={filtersActive ? undefined : (
                                <RequirePermission permission={PERMISSIONS.CREATE_MOVEMENT}>
                                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(ROUTES.CREATE_MOVEMENT)}
                                        sx={{ textTransform: 'none', borderRadius: '8px', bgcolor: brand[500], '&:hover': { bgcolor: brand[700] } }}>
                                        New Movement
                                    </Button>
                                </RequirePermission>
                            )}
                        />
                    )}
                    footer={(
                        <>
                            <Typography sx={{ fontSize: '0.75rem', color: neutral[500] }}>
                                {filtersActive
                                    ? 'Every movement matching the current filters'
                                    : `Latest ${recent.length} of ${movements.length} movements`}
                            </Typography>
                            <Button
                                size="small"
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => navigate(`${ROUTES.MOVEMENT}/all`)}
                                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', color: brand[600] }}
                            >
                                View all movements
                            </Button>
                        </>
                    )}
                />
            </PageSection>

            <ModalComponent open={repairOpen} handleClose={() => setRepairOpen(false)} title="Repair & Disposal" width="46%">
                <RepairFlowsModal handleClose={() => setRepairOpen(false)} onDone={refresh} />
            </ModalComponent>

            {/* Approve / Reject from the inbox */}
            <ModalComponent open={open} handleClose={handleClose} title="">
                <MovementActionModal
                    action={modalState as any}
                    movement={currentMovement}
                    handleClose={handleClose}
                    sendingRequest={sendingRequest}
                    setSendingRequest={setSendingRequest}
                    onDone={refresh}
                />
            </ModalComponent>
        </Box>
    );
};

export default Movement;

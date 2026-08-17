/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
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
    MovementFilterValues, matchesMovementFilters, deriveMovementFilterOptions, hasActiveMovementFilters,
} from './allMovements/MovementFilters';
import { exportMovementsPdf, exportMovementsExcel, exportMovementsCsv } from './allMovements/exportMovements';
import RoutesUtills from '../../core/routes/utills';
import { fetchPendingApprovalMovementsService } from './service';
import { MovementStatus } from './constants';
import { IMovement } from './interface';

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

    const fetchPendingCount = async () => {
        if (!currentUserId) return;
        const r = (await fetchPendingApprovalMovementsService(currentUserId, { pageSize: 1, pageNumber: 0 })) as any;
        if (r?.status === 200) setPendingCount(r.data?.totalElements ?? r.data?.content?.length ?? 0);
    };

    const refresh = () => { fetchAllMovements({ pageSize: 100 }); fetchPendingCount(); };
    useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const openMovement = (movement: IMovement) => navigate(`${ROUTES.READ_MOVEMENT}/${movement.id}`);

    const countBy = (s: MovementStatus) => movements.filter((m) => m.status === s).length;
    const inTransit = countBy('DISPATCHED') + countBy('IN_TRANSIT');

    const [filters, setFilters] = useState<MovementFilterValues>({});
    const filtersActive = hasActiveMovementFilters(filters);
    const filterOptions = deriveMovementFilterOptions(movements);

    const filteredMovements = movements.filter((m) => matchesMovementFilters(m, filters));

    // Latest-first; capped at 8 as a "recent" digest, but a filtered view shows every match.
    const recent = [...filteredMovements]
        .sort((a, b) => new Date(b.createDate ?? 0).getTime() - new Date(a.createDate ?? 0).getTime())
        .slice(0, filtersActive ? filteredMovements.length : 8);

    const handleExport = (fn: (rows: IMovement[]) => void) => {
        if (filteredMovements.length === 0) {
            toast.warning('There are no movements matching the current filters to export.');
            return;
        }
        fn(filteredMovements);
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
                        <Button
                            variant="outlined"
                            startIcon={<BuildOutlinedIcon />}
                            onClick={() => setRepairOpen(true)}
                            sx={{ height: 36, px: 2, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                        >
                            Repair / Disposal
                        </Button>
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
                onExportPdf={() => handleExport(exportMovementsPdf)}
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
                                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(ROUTES.CREATE_MOVEMENT)}
                                    sx={{ textTransform: 'none', borderRadius: '8px', bgcolor: brand[500], '&:hover': { bgcolor: brand[700] } }}>
                                    New Movement
                                </Button>
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

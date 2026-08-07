/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    alpha, Box, Button, Chip, CircularProgress, Grid, IconButton,
    Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import { toast } from 'react-toastify';
import { RootState } from '../../store';
import { ROUTES } from '../../core/routes/routes';
import ModalComponent from '../../components/modal';
import { PageHero, PageSection, StatTile, StatusChip, EmptyState } from '../../components/layout';
import { brand, neutral, border } from '../../utils/tokens';
import RoutesUtills from '../../core/routes/utills';
import { MovementContext } from '../../context/movement/MovementContext';
import MovementUtills from './utills';
import RepairFlowsModal from './RepairFlowsModal';
import MovementActionModal from './MovementActionModal';
import MovementFilters, {
    MovementFilterValues, matchesMovementFilters, deriveMovementFilterOptions, hasActiveMovementFilters,
} from './allMovements/MovementFilters';
import { exportMovementsPdf, exportMovementsExcel, exportMovementsCsv } from './allMovements/exportMovements';
import { fetchPendingApprovalMovementsService } from './service';
import { movementTypeLabel, statusLabel, statusTone, MovementStatus } from './constants';
import { IMovement } from './interface';

const destLabel = (m: IMovement) =>
    m.destStore?.name ?? (m.recipientUser ? `${m.recipientUser.firstName} ${m.recipientUser.lastName}` : '—');

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/** Shared cell styles so the two tables on this page read identically. */
const headCellSx = {
    bgcolor: neutral[50],
    color: neutral[500],
    fontWeight: 700,
    fontSize: '0.66rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    py: 1.25,
    px: 2.5,
    borderBottom: `1px solid ${border.subtle}`,
} as const;

const bodyRowSx = (isLast: boolean) => ({
    '& .MuiTableCell-root': {
        py: 1.25,
        px: 2.5,
        fontSize: '0.78rem',
        borderBottom: isLast ? 'none' : `1px solid ${border.subtle}`,
    },
    '&:hover': { bgcolor: alpha(brand[500], 0.03) },
});

const Movement = () => {
    const navigate = useNavigate();
    const { movements } = useSelector((state: RootState) => state.MovementStore);
    const { setCurrentMovement } = useContext(MovementContext);
    const {
        fetchAllMovements, loading, count, modalState, setModalState,
        open, handleOpen, handleClose, sendingRequest, setSendingRequest,
        currentMovement,
    } = MovementUtills();
    const [repairOpen, setRepairOpen] = useState(false);

    // Approval inbox: DRAFT movements assigned to the logged-in user, from the dedicated
    // server-side endpoint (not a client-side filter of the general list).
    const [pendingApprovals, setPendingApprovals] = useState<IMovement[]>([]);
    const [approvalsLoading, setApprovalsLoading] = useState(false);
    const currentUserId = RoutesUtills().getCurrentUser()?.id;

    const fetchPendingApprovals = async () => {
        if (!currentUserId) return;
        setApprovalsLoading(true);
        try {
            const r = (await fetchPendingApprovalMovementsService(currentUserId, { pageSize: 25, pageNumber: 0 })) as any;
            if (r?.status === 200) setPendingApprovals(r.data?.content ?? []);
        } finally {
            setApprovalsLoading(false);
        }
    };

    const refresh = () => { fetchAllMovements({ pageSize: 100 }); fetchPendingApprovals(); };
    useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const openApprovalAction = (state: 'approve' | 'reject', movement: IMovement) => {
        setCurrentMovement(movement);
        setModalState(state);
        handleOpen();
    };

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
                    <Stack direction="row" spacing={1.25}>
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

            {/* Approval inbox — movements awaiting the logged-in user's decision */}
            {(approvalsLoading || pendingApprovals.length > 0) && (
                <PageSection
                    title="Pending My Approval"
                    subtitle="Movements waiting for your decision before they can proceed"
                    icon={<PendingActionsOutlinedIcon />}
                    actions={
                        <Chip
                            label={pendingApprovals.length}
                            size="small"
                            sx={{ height: 22, fontWeight: 800, bgcolor: alpha('#F59E0B', 0.14), color: '#B45309' }}
                        />
                    }
                    mb={4}
                >
                    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', borderColor: border.subtle }}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ '& .MuiTableCell-head': headCellSx }}>
                                        <TableCell>Ref</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Source → Destination</TableCell>
                                        <TableCell>Initiated By</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {approvalsLoading ? (
                                        <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 3, border: 'none' }}><CircularProgress size={24} sx={{ color: brand[500] }} /></TableCell></TableRow>
                                    ) : pendingApprovals.map((mov, idx) => (
                                        <TableRow key={mov.id} sx={bodyRowSx(idx === pendingApprovals.length - 1)}>
                                            <TableCell>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: brand[600], fontFamily: 'monospace' }}>#{mov.id}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <StatusChip label={movementTypeLabel(mov.movementType)} tone="brand" />
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={0.75}>
                                                    <Typography variant="caption" noWrap>{mov.sourceStore?.name ?? '—'}</Typography>
                                                    <ArrowForwardIcon sx={{ fontSize: 11, color: neutral[400] }} />
                                                    <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>{destLabel(mov)}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" sx={{ color: neutral[500] }}>
                                                    {mov.initiator ? `${mov.initiator.firstName} ${mov.initiator.lastName}` : '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" sx={{ color: neutral[500] }}>{fmtDate(mov.createDate)}</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    <Tooltip title="View details" arrow>
                                                        <IconButton size="small" onClick={() => navigate(`${ROUTES.READ_MOVEMENT}/${mov.id}`)} sx={{ color: brand[600] }}>
                                                            <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Approve" arrow>
                                                        <IconButton size="small" onClick={() => openApprovalAction('approve', mov)} sx={{ color: '#15803D' }}>
                                                            <CheckCircleOutlineIcon sx={{ fontSize: 15 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reject" arrow>
                                                        <IconButton size="small" onClick={() => openApprovalAction('reject', mov)} sx={{ color: '#B91C1C' }}>
                                                            <HighlightOffIcon sx={{ fontSize: 15 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </PageSection>
            )}

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
                actions={
                    <Button
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        startIcon={<ListAltOutlinedIcon />}
                        onClick={() => navigate(`${ROUTES.MOVEMENT}/all`)}
                        sx={{ textTransform: 'none', fontWeight: 600, color: brand[600] }}
                    >
                        View All
                    </Button>
                }
                mb={0}
            >
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', borderColor: border.subtle }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& .MuiTableCell-head': headCellSx }}>
                                    <TableCell>Ref</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Source → Destination</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">View</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, border: 'none' }}><CircularProgress size={28} sx={{ color: brand[500] }} /></TableCell></TableRow>
                                ) : recent.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ border: 'none', p: 0 }}>
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
                                        </TableCell>
                                    </TableRow>
                                ) : recent.map((mov, idx) => (
                                    <TableRow key={mov.id} sx={bodyRowSx(idx === recent.length - 1)}>
                                        <TableCell>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: brand[600], fontFamily: 'monospace' }}>#{mov.id}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <StatusChip label={movementTypeLabel(mov.movementType)} tone="brand" />
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={0.75}>
                                                <Typography variant="caption" noWrap>{mov.sourceStore?.name ?? '—'}</Typography>
                                                <ArrowForwardIcon sx={{ fontSize: 11, color: neutral[400] }} />
                                                <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>{destLabel(mov)}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <StatusChip label={statusLabel(mov.status)} tone={statusTone(mov.status)} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View details" arrow>
                                                <IconButton size="small" onClick={() => navigate(`${ROUTES.READ_MOVEMENT}/${mov.id}`)} sx={{ color: brand[600] }}>
                                                    <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
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

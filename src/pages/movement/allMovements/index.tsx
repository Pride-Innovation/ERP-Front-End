/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    alpha, Box, Button, Chip, CircularProgress, Grid, IconButton, InputAdornment,
    Paper, Stack, Tab, Table, TableBody, TableCell, TableContainer,
    TableHead, TablePagination, TableRow, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { RootState } from '../../../store';
import { MovementContext } from '../../../context/movement/MovementContext';
import { ROUTES } from '../../../core/routes/routes';
import ModalComponent from '../../../components/modal';
import { PageHero, StatTile, StatusChip, EmptyState } from '../../../components/layout';
import { brand, neutral, border } from '../../../utils/tokens';
import MovementUtills from '../utills';
import MovementActionModal from '../MovementActionModal';
import MovementFilters, {
    MovementFilterValues, matchesMovementFilters, deriveMovementFilterOptions,
} from './MovementFilters';
import { exportMovementsPdf, exportMovementsExcel, exportMovementsCsv } from './exportMovements';
import { IMovement } from '../interface';
import {
    movementTypeLabel, statusLabel, statusTone,
    canDispatch, canMarkInTransit, canReceive, canComplete, canCancel, canApproveMovement,
} from '../constants';
import RoutesUtills from '../../../core/routes/utills';

const STATUS_TABS: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'DRAFT', label: 'Awaiting Approval' },
    { value: 'INITIATED', label: 'Initiated' },
    { value: 'DISPATCHED', label: 'Dispatched' },
    { value: 'IN_TRANSIT', label: 'In Transit' },
    { value: 'RECEIVED', label: 'Received' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

const destLabel = (m: IMovement) =>
    m.destStore?.name ?? (m.recipientUser ? `${m.recipientUser.firstName} ${m.recipientUser.lastName}` : '—');

const AllMovements = () => {
    const navigate = useNavigate();
    const { movements } = useSelector((state: RootState) => state.MovementStore);
    const { setCurrentMovement } = useContext(MovementContext);
    const {
        fetchAllMovements, loading, count, modalState, setModalState,
        open, handleOpen, handleClose, sendingRequest, setSendingRequest,
        currentMovement,
    } = MovementUtills();

    const [search, setSearch] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState<MovementFilterValues>({});

    const refresh = () => fetchAllMovements({ pageSize: 100 });
    useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const filtered = movements.filter((m) => {
        const matchesSearch = !search || [
            `#${m.id}`,
            movementTypeLabel(m.movementType),
            m.sourceStore?.name,
            destLabel(m),
            m.trackingNumber,
        ].some((f) => f?.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = statusTab === 'all' || m.status === statusTab;
        return matchesSearch && matchesStatus && matchesMovementFilters(m, filters);
    });

    const filterOptions = deriveMovementFilterOptions(movements);

    const handleExport = (fn: (rows: IMovement[]) => void) => {
        if (filtered.length === 0) {
            toast.warning('There are no movements matching the current filters to export.');
            return;
        }
        fn(filtered);
    };

    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const statusCounts = movements.reduce((acc: Record<string, number>, m) => {
        const s = m.status ?? '';
        acc[s] = (acc[s] ?? 0) + 1;
        return acc;
    }, {});

    const summaryTiles: Array<{ status: string; label: string; icon: JSX.Element; accent: 'warning' | 'gold' | 'info' | 'brand' | 'success' }> = [
        { status: 'DRAFT', label: 'Awaiting Approval', icon: <PendingActionsOutlinedIcon />, accent: 'warning' },
        { status: 'INITIATED', label: 'Initiated', icon: <SwapHorizOutlinedIcon />, accent: 'gold' },
        { status: 'DISPATCHED', label: 'Dispatched', icon: <LocalShippingOutlinedIcon />, accent: 'info' },
        { status: 'RECEIVED', label: 'Received', icon: <AssignmentTurnedInOutlinedIcon />, accent: 'brand' },
        { status: 'COMPLETED', label: 'Completed', icon: <TaskAltOutlinedIcon />, accent: 'success' },
    ];

    const currentUserId = RoutesUtills().getCurrentUser()?.id;

    const openModal = (state: string, movement: IMovement) => {
        setCurrentMovement(movement);
        setModalState(state);
        handleOpen();
    };

    const todayLabel = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        // Same page padding PageShell applied, so swapping the header for PageHero keeps alignment.
        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
            <PageHero
                title="All Movements"
                subtitle="Store-to-store and asset transfers across locations"
                icon={<SwapHorizOutlinedIcon />}
                stat={{ value: (count ?? 0).toLocaleString(), label: 'movements', helper: todayLabel }}
                actions={
                    <Stack direction="row" spacing={1.25} alignItems="center">
                        <Tooltip title="Refresh" arrow>
                            <IconButton
                                onClick={refresh}
                                sx={{
                                    width: 36, height: 36, borderRadius: '8px', bgcolor: '#fff',
                                    border: `1px solid ${border.subtle}`, color: neutral[500],
                                    '&:hover': { borderColor: brand[500], color: brand[600], bgcolor: alpha(brand[500], 0.04) },
                                }}
                            >
                                <RefreshIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
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
            {/* Status summary tiles (click to filter) */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {summaryTiles.map((t) => (
                    <Grid item xs={6} sm={4} md={2.4} key={t.status}>
                        <StatTile
                            label={t.label}
                            value={statusCounts[t.status] ?? 0}
                            icon={t.icon}
                            accent={t.accent}
                            onClick={() => { setStatusTab(statusTab === t.status ? 'all' : t.status); setPage(0); }}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* Filters & export bar — same styling as the Reports page */}
            <MovementFilters
                sources={filterOptions.sources}
                destinations={filterOptions.destinations}
                couriers={filterOptions.couriers}
                initiators={filterOptions.initiators}
                onApply={(f) => { setFilters(f); setPage(0); }}
                onExportPdf={() => handleExport(exportMovementsPdf)}
                onExportExcel={() => handleExport(exportMovementsExcel)}
                onExportCsv={() => handleExport(exportMovementsCsv)}
                onRefresh={refresh}
            />

            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', borderColor: border.subtle }}>
                {/* Toolbar: search + count */}
                <Box sx={{ px: 2.5, pt: 2, pb: 0, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Search by id, type, store, destination, or tracking..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        sx={{
                            flex: 1, minWidth: 240,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px', height: 36, bgcolor: '#fff',
                                '& fieldset': { borderColor: border.subtle },
                                '&:hover fieldset': { borderColor: brand[500] },
                                '&.Mui-focused fieldset': { borderColor: brand[500], borderWidth: 1.5 },
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 18, color: neutral[400] }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Chip
                        label={`${count ?? 0} total`}
                        size="small"
                        sx={{ height: 26, fontWeight: 600, fontSize: '0.72rem', bgcolor: alpha(brand[500], 0.07), color: brand[700] }}
                    />
                </Box>

                {/* Status tabs */}
                <Tabs
                    value={statusTab}
                    onChange={(_, v) => { setStatusTab(v); setPage(0); }}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        px: 1.5, borderBottom: `1px solid ${border.subtle}`,
                        '& .MuiTab-root': { fontSize: '0.75rem', fontWeight: 600, minWidth: 80, textTransform: 'none', color: neutral[500] },
                        '& .MuiTabs-indicator': { bgcolor: brand[500] },
                        '& .MuiTab-root.Mui-selected': { color: brand[600] },
                    }}
                >
                    {STATUS_TABS.map((t) => <Tab key={t.value} value={t.value} label={t.label} />)}
                </Tabs>

                {/* Table */}
                <TableContainer>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow sx={{
                                '& .MuiTableCell-head': {
                                    bgcolor: neutral[50], color: neutral[500], fontWeight: 700, fontSize: '0.66rem',
                                    textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                                    borderBottom: `1px solid ${border.subtle}`, py: 1.25, px: 2.5,
                                },
                            }}>
                                <TableCell>Ref</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Source → Destination</TableCell>
                                <TableCell align="center">Items</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={7} sx={{ textAlign: 'center', py: 5, border: 'none' }}><CircularProgress size={32} sx={{ color: brand[500] }} /></TableCell></TableRow>
                            ) : paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} sx={{ border: 'none', p: 0 }}>
                                        <EmptyState
                                            variant="inline"
                                            title="No movements found"
                                            description={search || statusTab !== 'all'
                                                ? 'Try a different search term or clear the status filter.'
                                                : 'Create a movement to see it listed here.'}
                                            icon={<SwapHorizOutlinedIcon />}
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : paginated.map((mov) => (
                                <TableRow
                                    key={mov.id}
                                    sx={{
                                        '&:hover': { bgcolor: alpha(brand[500], 0.03), boxShadow: `inset 3px 0 0 ${brand[500]}` },
                                        '& .MuiTableCell-root': { py: 1.5, px: 2.5, fontSize: '0.78rem', color: neutral[900], borderBottom: `1px solid ${border.subtle}` },
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: brand[600], fontFamily: 'monospace' }}>#{mov.id}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip label={movementTypeLabel(mov.movementType)} tone="brand" />
                                        <Typography variant="caption" sx={{ display: 'block', color: neutral[400], fontSize: '0.62rem', mt: 0.25 }}>
                                            {mov.movementCategory === 'INTER_LOCATION' ? 'Inter-location' : 'Intra-location'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" alignItems="center" spacing={0.75}>
                                            <Typography variant="caption" sx={{ fontWeight: 500 }} noWrap>{mov.sourceStore?.name ?? '—'}</Typography>
                                            <ArrowForwardIcon sx={{ fontSize: 12, color: neutral[400] }} />
                                            <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>{destLabel(mov)}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="center">
                                        <StatusChip label={String(mov.items?.length ?? 0)} tone="gold" />
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip label={statusLabel(mov.status)} tone={statusTone(mov.status)} />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" sx={{ color: neutral[500] }}>
                                            {mov.createDate ? new Date(mov.createDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                            <Tooltip title="View details" arrow>
                                                <IconButton size="small" onClick={() => navigate(`${ROUTES.READ_MOVEMENT}/${mov.id}`)} sx={{ color: brand[600], '&:hover': { bgcolor: alpha(brand[500], 0.08) } }}>
                                                    <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
                                                </IconButton>
                                            </Tooltip>
                                            {canApproveMovement(mov, currentUserId) && (
                                                <>
                                                    <Tooltip title="Approve" arrow><IconButton size="small" onClick={() => openModal('approve', mov)} sx={{ color: '#15803D' }}><CheckCircleOutlineIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                                    <Tooltip title="Reject" arrow><IconButton size="small" onClick={() => openModal('reject', mov)} sx={{ color: '#B91C1C' }}><HighlightOffIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                                </>
                                            )}
                                            {canDispatch(mov) && (
                                                <Tooltip title="Dispatch" arrow><IconButton size="small" onClick={() => openModal('dispatch', mov)} sx={{ color: '#2563EB' }}><LocalShippingOutlinedIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                            )}
                                            {canMarkInTransit(mov) && (
                                                <Tooltip title="Mark in transit" arrow><IconButton size="small" onClick={() => openModal('in-transit', mov)} sx={{ color: '#4338CA' }}><FlightTakeoffOutlinedIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                            )}
                                            {canReceive(mov) && (
                                                <Tooltip title="Receive" arrow><IconButton size="small" onClick={() => openModal('receive', mov)} sx={{ color: '#047857' }}><AssignmentTurnedInOutlinedIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                            )}
                                            {canComplete(mov) && (
                                                <Tooltip title="Complete" arrow><IconButton size="small" onClick={() => openModal('complete', mov)} sx={{ color: '#15803D' }}><TaskAltOutlinedIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                            )}
                                            {canCancel(mov) && (
                                                <Tooltip title="Cancel" arrow><IconButton size="small" onClick={() => openModal('cancel', mov)} sx={{ color: '#DC2626' }}><CancelOutlinedIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {filtered.length > 0 && (
                    <Box sx={{ borderTop: `1px solid ${border.subtle}`, bgcolor: neutral[50] }}>
                        <TablePagination
                            component="div"
                            count={filtered.length}
                            page={page}
                            onPageChange={(_, p) => setPage(p)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                        />
                    </Box>
                )}
            </Paper>

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

export default AllMovements;

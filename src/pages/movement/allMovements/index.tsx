import { RequirePermission } from '../../../core/permissions';
import { PERMISSIONS } from '../../../core/permissions/constants';
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    alpha, Box, Button, Grid, IconButton, Paper, Stack, Tab, Tabs, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { RootState } from '../../../store';
import { MovementContext } from '../../../context/movement/MovementContext';
import { ROUTES } from '../../../core/routes/routes';
import ModalComponent from '../../../components/modal';
import { PageHero, StatTile, EmptyState } from '../../../components/layout';
import { brand, neutral, border } from '../../../utils/tokens';
import MovementUtills from '../utills';
import MovementTable from '../MovementTable';
import MovementActionModal from '../MovementActionModal';
import MovementFilters, {
    MovementFilterValues, matchesMovementFilters, deriveMovementFilterOptions,
} from './MovementFilters';
import { exportMovementsPdf, exportMovementsExcel, exportMovementsCsv } from './exportMovements';
import { IMovement } from '../interface';
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

const AllMovements = () => {
    const navigate = useNavigate();
    const { movements } = useSelector((state: RootState) => state.MovementStore);
    const { setCurrentMovement } = useContext(MovementContext);
    const {
        fetchAllMovements, loading, count, modalState, setModalState,
        open, handleOpen, handleClose, sendingRequest, setSendingRequest,
        currentMovement,
    } = MovementUtills();

    const [statusTab, setStatusTab] = useState('all');
    const [filters, setFilters] = useState<MovementFilterValues>({});

    const refresh = () => fetchAllMovements({ pageSize: 100 });
    useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const filtered = movements.filter((m) => {
        const matchesStatus = statusTab === 'all' || m.status === statusTab;
        return matchesStatus && matchesMovementFilters(m, filters);
    });

    const filterOptions = deriveMovementFilterOptions(movements);

    const handleExport = (fn: (rows: IMovement[]) => void) => {
        if (filtered.length === 0) {
            toast.warning('There are no movements matching the current filters to export.');
            return;
        }
        fn(filtered);
    };

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
                        {/* POST /movements is guarded by CREATE_MOVEMENT; offering the button to
                            someone without it sends them to a form whose save then fails. */}
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
            {/* Status summary tiles (click to filter) */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {summaryTiles.map((t) => (
                    <Grid item xs={6} sm={4} md={2.4} key={t.status}>
                        <StatTile
                            label={t.label}
                            value={statusCounts[t.status] ?? 0}
                            icon={t.icon}
                            accent={t.accent}
                            onClick={() => setStatusTab(statusTab === t.status ? 'all' : t.status)}
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
                onApply={setFilters}
                onExportPdf={() => handleExport(exportMovementsPdf)}
                onExportExcel={() => handleExport(exportMovementsExcel)}
                onExportCsv={() => handleExport(exportMovementsCsv)}
                onRefresh={refresh}
            />

            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', borderColor: border.subtle }}>
                {/* Status tabs — each carries its own count so the split is readable without clicking.
                    Narrowing the list is the "Filters & Options" panel's job; this card only tabs. */}
                <Tabs
                    value={statusTab}
                    onChange={(_, v) => setStatusTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        px: 1.5, mt: 1.5, borderBottom: `1px solid ${border.subtle}`,
                        minHeight: 40,
                        '& .MuiTab-root': {
                            fontSize: '0.75rem', fontWeight: 600, minWidth: 80, minHeight: 40,
                            textTransform: 'none', color: neutral[500], py: 0,
                        },
                        '& .MuiTabs-indicator': { bgcolor: brand[500], height: 2.5, borderRadius: '2px 2px 0 0' },
                        '& .MuiTab-root.Mui-selected': { color: brand[600] },
                    }}
                >
                    {STATUS_TABS.map((t) => {
                        const n = t.value === 'all' ? movements.length : (statusCounts[t.value] ?? 0);
                        const selected = statusTab === t.value;
                        return (
                            <Tab
                                key={t.value}
                                value={t.value}
                                label={(
                                    <Stack direction="row" alignItems="center" spacing={0.75}>
                                        <span>{t.label}</span>
                                        <Box
                                            sx={{
                                                minWidth: 18, px: 0.5, height: 18, borderRadius: '9px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.62rem', fontWeight: 700,
                                                bgcolor: selected ? alpha(brand[500], 0.12) : neutral[100],
                                                color: selected ? brand[700] : neutral[500],
                                            }}
                                        >
                                            {n}
                                        </Box>
                                    </Stack>
                                )}
                            />
                        );
                    })}
                </Tabs>

                {/* Table */}
                <MovementTable
                    variant="lifecycle"
                    rows={filtered}
                    loading={loading}
                    onView={(mov) => navigate(`${ROUTES.READ_MOVEMENT}/${mov.id}`)}
                    onAction={(action, mov) => openModal(action, mov)}
                    currentUserId={currentUserId}
                    actionsAs="menu"
                    disableSurface
                    stickyHeader
                    maxHeight="clamp(320px, calc(100vh - 370px), 1400px)"
                    paginateOver={0}
                    paginationResetKey={`${statusTab}|${JSON.stringify(filters)}`}
                    empty={(
                        <EmptyState
                            variant="inline"
                            title="No movements found"
                            description={statusTab !== 'all' || Object.values(filters).some(Boolean)
                                ? 'Adjust the filters above or pick a different status tab.'
                                : 'Create a movement to see it listed here.'}
                            icon={<SwapHorizOutlinedIcon />}
                        />
                    )}
                />
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

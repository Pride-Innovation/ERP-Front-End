/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    alpha, Box, Button, Grid, IconButton, Paper, Stack, Tab, Tabs, Tooltip, Typography,
} from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WhereToVoteOutlinedIcon from '@mui/icons-material/WhereToVoteOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { toast } from 'react-toastify';
import { PageHero, StatTile, EmptyState } from '../../components/layout';
import { brand, neutral, border, status as statusTokens } from '../../utils/tokens';
import { ROUTES } from '../../core/routes/routes';
import ModalComponent from '../../components/modal';
import { IConsignment, ConsignmentStatus } from './interface';
import {
    fetchConsignmentsService, fetchConsignmentService, markConsignmentInTransitService,
    markConsignmentArrivedService, cancelConsignmentService,
} from './service';
import ConsignmentTable, { ConsignmentAction } from './ConsignmentTable';
import ConsignmentFilters, {
    ConsignmentFilterValues, matchesConsignmentFilters, deriveConsignmentFilterOptions,
} from './ConsignmentFilters';
import {
    exportConsignmentsPdf, exportConsignmentsExcel, exportConsignmentsCsv,
} from './exportConsignments';
import ConsignmentDetail from './ConsignmentDetail';
import CreateConsignment from './CreateConsignment';
import DispatchConsignment from './DispatchConsignment';
import ReceiveConsignment from './ReceiveConsignment';

const STATUS_TABS: Array<{ value: TabValue; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'DRAFT', label: 'Being loaded' },
    { value: 'DISPATCHED', label: 'Dispatched' },
    { value: 'IN_TRANSIT', label: 'In transit' },
    { value: 'ARRIVED', label: 'Arrived' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

/**
 * Tab values are the statuses, plus `ON_ROAD` — a tile-only filter spanning both travelling
 * states, because "where are my vans" is a question the two statuses answer together.
 */
type TabValue = 'all' | 'ON_ROAD' | ConsignmentStatus;

const onRoad = (c: IConsignment) => c.status === 'DISPATCHED' || c.status === 'IN_TRANSIT';

const isOverdue = (c: IConsignment) => {
    if (c.status !== 'DISPATCHED' && c.status !== 'IN_TRANSIT') return false;
    if (!c.expectedDeliveryDate) return false;
    const due = new Date(c.expectedDeliveryDate);
    return !Number.isNaN(due.getTime()) && due.getTime() < Date.now();
};

const Consignments = () => {
    const navigate = useNavigate();
    const [rows, setRows] = useState<IConsignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<TabValue>('all');
    const [filters, setFilters] = useState<ConsignmentFilterValues>({});
    const [busyId, setBusyId] = useState<number | null>(null);

    const [detail, setDetail] = useState<IConsignment | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    /** The consignment being handed to a courier — dispatch needs a form, not a one-click action. */
    const [dispatching, setDispatching] = useState<IConsignment | null>(null);
    /** The landed consignment being handed over to its recipients. */
    const [receiving, setReceiving] = useState<IConsignment | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = (await fetchConsignmentsService({ pageSize: 100 })) as any;
            if (res?.status === 200) setRows(res.data?.content ?? []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const visible = useMemo(() => {
        const byTab = tab === 'all'
            ? rows
            : (tab === 'ON_ROAD' ? rows.filter(onRoad) : rows.filter((r) => r.status === tab));
        return byTab.filter((c) => matchesConsignmentFilters(c, filters));
    }, [rows, tab, filters]);

    const filterOptions = useMemo(() => deriveConsignmentFilterOptions(rows), [rows]);

    /** Exports carry what the screen is showing, not the whole unfiltered list. */
    const handleExport = (fn: (list: IConsignment[]) => void) => {
        if (visible.length === 0) {
            toast.warning('There are no consignments matching the current filters to export.');
            return;
        }
        fn(visible);
    };

    const counts = useMemo(() => ({
        loading: rows.filter((r) => r.status === 'DRAFT').length,
        moving: rows.filter(onRoad).length,
        arrived: rows.filter((r) => r.status === 'ARRIVED').length,
        /** Landed but not fully handed over — the queue that actually needs someone today. */
        overdue: rows.filter(isOverdue).length,
    }), [rows]);

    /** Per-status tallies for the tab badges, counted after the filter panel has had its say. */
    const filteredRows = useMemo(
        () => rows.filter((c) => matchesConsignmentFilters(c, filters)),
        [rows, filters],
    );

    const tabCounts = useMemo(() => filteredRows.reduce((acc: Record<string, number>, r) => {
        acc[r.status] = (acc[r.status] ?? 0) + 1;
        return acc;
    }, {}), [filteredRows]);

    const openDetail = async (id: number) => {
        const res = (await fetchConsignmentService(id)) as any;
        if (res?.status === 200) {
            setDetail(res.data);
            setDetailOpen(true);
        } else {
            toast.error('Could not load this consignment.');
        }
    };

    /*
     * Loads the detail before opening the dispatch form. List rows carry counts only — the dispatch
     * note lists every item on the van, so handing it a summary row would print an empty note.
     */
    const openDispatch = async (id: number) => {
        setBusyId(id);
        try {
            const res = (await fetchConsignmentService(id)) as any;
            if (res?.status === 200) {
                setDispatching(res.data);
            } else {
                toast.error('Could not load this consignment.');
            }
        } finally {
            setBusyId(null);
        }
    };

    /** Same reason as dispatch: the hand-over form needs the movements, not just a count. */
    const openReceive = async (id: number) => {
        setBusyId(id);
        try {
            const res = (await fetchConsignmentService(id)) as any;
            if (res?.status === 200) {
                setReceiving(res.data);
            } else {
                toast.error('Could not load this consignment.');
            }
        } finally {
            setBusyId(null);
        }
    };

    /**
     * Lifecycle actions apply to every movement on the journey at once, so a failure is reported
     * rather than swallowed — a half-applied load is the one state nobody could reason about.
     */
    const runAction = async (
        id: number,
        action: (id: number) => Promise<any>,
        successMessage: string
    ) => {
        setBusyId(id);
        try {
            const res = (await action(id)) as any;
            if (res?.status === 200) {
                toast.success(successMessage);
                await load();
                if (detailOpen && detail?.id === id) await openDetail(id);
            } else {
                toast.error(res?.data?.message ?? 'That did not work.');
            }
        } finally {
            setBusyId(null);
        }
    };

    /** Single entry point for everything a row's dropdown can raise. */
    const handleRowAction = (action: ConsignmentAction, c: IConsignment) => {
        switch (action) {
            case 'open': openDetail(c.id); break;
            case 'dispatch': openDispatch(c.id); break;
            case 'hand-over': openReceive(c.id); break;
            case 'in-transit':
                runAction(c.id, markConsignmentInTransitService, 'Consignment is in transit.');
                break;
            case 'arrived':
                runAction(c.id, markConsignmentArrivedService, 'Consignment arrived — stock is in the destination store.');
                break;
            case 'cancel':
                runAction(c.id, (id) => cancelConsignmentService(id), 'Consignment cancelled.');
                break;
            default: break;
        }
    };

    const todayLabel = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        // Same page padding as the movement pages, so the whole module aligns.
        <Box sx={{ minHeight: '100vh', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, pb: 4 }}>
            <PageHero
                title="Consignments"
                subtitle="One journey, many movements — the vans the transfers ride on"
                icon={<LocalShippingOutlinedIcon />}
                stat={{ value: rows.length.toLocaleString(), label: 'journeys', helper: todayLabel }}
                actions={
                    <Stack direction="row" spacing={1.25} alignItems="center">
                        <Tooltip title="Refresh" arrow>
                            <IconButton
                                onClick={load}
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
                            variant="outlined"
                            startIcon={<SwapHorizOutlinedIcon />}
                            onClick={() => navigate(ROUTES.MOVEMENT)}
                            sx={{ height: 36, px: 2, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                        >
                            Movements
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateOpen(true)}
                            sx={{
                                height: 36, px: 2.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600,
                                bgcolor: brand[500], '&:hover': { bgcolor: brand[700] },
                                boxShadow: `0 2px 8px ${alpha(brand[500], 0.3)}`,
                            }}
                        >
                            New Consignment
                        </Button>
                    </Stack>
                }
            />

            {/* Journey overview — click a tile to filter the list to it */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={6} md={3}>
                    <StatTile
                        label="Being loaded"
                        value={counts.loading}
                        accent="brand"
                        icon={<Inventory2OutlinedIcon />}
                        tooltip="Drafts still accepting movements. Nothing has left the store."
                        onClick={() => setTab(tab === 'DRAFT' ? 'all' : 'DRAFT')}
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                    <StatTile
                        label="On the road"
                        value={counts.moving}
                        accent="info"
                        icon={<LocalShippingOutlinedIcon />}
                        tooltip="Dispatched or in transit — stock sits against the courier."
                        onClick={() => setTab(tab === 'ON_ROAD' ? 'all' : 'ON_ROAD')}
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                    <StatTile
                        label="Arrived"
                        value={counts.arrived}
                        accent="success"
                        icon={<WhereToVoteOutlinedIcon />}
                        tooltip="Landed at the destination store, awaiting hand-over to recipients."
                        onClick={() => setTab(tab === 'ARRIVED' ? 'all' : 'ARRIVED')}
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                    <StatTile
                        label="Overdue"
                        value={counts.overdue}
                        accent={counts.overdue > 0 ? 'danger' : 'neutral'}
                        icon={<WarningAmberOutlinedIcon />}
                        tooltip="On the road past their expected delivery date."
                        helper={counts.overdue > 0 ? 'Past expected delivery' : 'All on schedule'}
                    />
                </Grid>
            </Grid>

            {/* Hand-over queue — the one thing on this page that is somebody's job right now */}
            {counts.arrived > 0 && (
                <Paper
                    variant="outlined"
                    sx={{
                        mb: 2.5, px: 2.5, py: 1.5, borderRadius: 2,
                        display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
                        borderColor: alpha(statusTokens.success.main, 0.3),
                        bgcolor: alpha(statusTokens.success.main, 0.04),
                    }}
                >
                    <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 18, color: statusTokens.success.strong }} />
                    <Typography sx={{ fontSize: '0.82rem', color: neutral[700], flex: 1, minWidth: 200 }}>
                        <Box component="span" sx={{ fontWeight: 700, color: neutral[900] }}>
                            {counts.arrived} consignment{counts.arrived === 1 ? '' : 's'}
                        </Box>
                        {' '}landed and waiting to be handed over to their recipients.
                    </Typography>
                    <Button
                        size="small"
                        onClick={() => setTab('ARRIVED')}
                        endIcon={<ArrowForwardIcon sx={{ fontSize: '16px !important' }} />}
                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', color: statusTokens.success.strong }}
                    >
                        Show them
                    </Button>
                </Paper>
            )}

            {/* Filters & export bar — same control as the movements page */}
            <ConsignmentFilters
                sources={filterOptions.sources}
                destinations={filterOptions.destinations}
                couriers={filterOptions.couriers}
                onApply={setFilters}
                onExportPdf={() => handleExport(exportConsignmentsPdf)}
                onExportExcel={() => handleExport(exportConsignmentsExcel)}
                onExportCsv={() => handleExport(exportConsignmentsCsv)}
                onRefresh={load}
            />

            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', borderColor: border.subtle }}>
                {/* Status tabs, each carrying its own count */}
                <Tabs
                    // `false` when the "On the road" tile is driving the filter — no single tab owns it.
                    value={STATUS_TABS.some((t) => t.value === tab) ? tab : false}
                    onChange={(_, v) => setTab(v)}
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
                        const n = t.value === 'all' ? filteredRows.length : (tabCounts[t.value] ?? 0);
                        const selected = tab === t.value;
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

                <ConsignmentTable
                    rows={visible}
                    loading={loading}
                    busyId={busyId}
                    paginationResetKey={`${tab}|${JSON.stringify(filters)}`}
                    onAction={handleRowAction}
                    disableSurface
                    stickyHeader
                    maxHeight="clamp(320px, calc(100vh - 470px), 1400px)"
                    empty={(
                        <EmptyState
                            variant="inline"
                            icon={<LocalShippingOutlinedIcon />}
                            title={tab === 'all'
                                ? 'No consignments yet'
                                : `Nothing ${(STATUS_TABS.find((t) => t.value === tab)?.label ?? 'on the road').toLowerCase()}`}
                            description={tab === 'all'
                                ? 'A consignment groups the movements travelling together on one courier run. Open one when you are ready to load a van.'
                                : 'Switch to another tab, or open a new consignment to start loading one.'}
                            action={tab === 'all' ? (
                                <Button
                                    variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}
                                    sx={{
                                        textTransform: 'none', borderRadius: '8px', fontWeight: 600,
                                        bgcolor: brand[500], '&:hover': { bgcolor: brand[700] },
                                    }}
                                >
                                    New Consignment
                                </Button>
                            ) : undefined}
                        />
                    )}
                />
            </Paper>

            {detailOpen && detail && (
                <ModalComponent
                    title={`Consignment ${detail.reference ?? `#${detail.id}`}`}
                    open={detailOpen}
                    handleClose={() => setDetailOpen(false)}
                    width="60%"
                >
                    <ConsignmentDetail
                        consignment={detail}
                        onChanged={async () => { await load(); await openDetail(detail.id); }}
                        onOpenMovement={(movementId) => navigate(`${ROUTES.READ_MOVEMENT}/${movementId}`)}
                    />
                </ModalComponent>
            )}

            {dispatching && (
                <ModalComponent
                    title={`Dispatch ${dispatching.reference ?? `#${dispatching.id}`}`}
                    open={!!dispatching}
                    handleClose={() => setDispatching(null)}
                    width="50%"
                >
                    <DispatchConsignment
                        consignment={dispatching}
                        handleClose={() => setDispatching(null)}
                        onDispatched={async () => {
                            const id = dispatching.id;
                            setDispatching(null);
                            await load();
                            if (detailOpen && detail?.id === id) await openDetail(id);
                        }}
                    />
                </ModalComponent>
            )}

            {receiving && (
                <ModalComponent
                    title={`Hand over — ${receiving.reference ?? `#${receiving.id}`}`}
                    open={!!receiving}
                    handleClose={() => setReceiving(null)}
                    width="55%"
                >
                    <ReceiveConsignment
                        consignment={receiving}
                        handleClose={() => setReceiving(null)}
                        onReceived={async () => {
                            const id = receiving.id;
                            setReceiving(null);
                            await load();
                            if (detailOpen && detail?.id === id) await openDetail(id);
                        }}
                    />
                </ModalComponent>
            )}

            {createOpen && (
                <ModalComponent
                    title="New consignment"
                    open={createOpen}
                    handleClose={() => setCreateOpen(false)}
                    width="45%"
                >
                    <CreateConsignment
                        handleClose={() => setCreateOpen(false)}
                        onCreated={async (id) => { setCreateOpen(false); await load(); await openDetail(id); }}
                    />
                </ModalComponent>
            )}
        </Box>
    );
};

export default Consignments;

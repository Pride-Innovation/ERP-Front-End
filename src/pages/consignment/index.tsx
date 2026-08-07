/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    alpha, Box, Button, Chip, CircularProgress, Paper, Stack,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Tab, Tabs, Tooltip,
} from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import WhereToVoteOutlinedIcon from '@mui/icons-material/WhereToVoteOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { toast } from 'react-toastify';
import { PageHero, StatTile, EmptyState } from '../../components/layout';
import { brand, neutral, border, status as statusTokens } from '../../utils/tokens';
import { ROUTES } from '../../core/routes/routes';
import ModalComponent from '../../components/modal';
import {
    IConsignment, ConsignmentStatus, consignmentStatusLabels, consignmentStatusHelp,
} from './interface';
import {
    fetchConsignmentsService, fetchConsignmentService, markConsignmentInTransitService,
    markConsignmentArrivedService, cancelConsignmentService,
} from './service';
import ConsignmentDetail from './ConsignmentDetail';
import CreateConsignment from './CreateConsignment';
import DispatchConsignment from './DispatchConsignment';
import ReceiveConsignment from './ReceiveConsignment';

const STATUS_TABS: Array<{ value: 'all' | ConsignmentStatus; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'DRAFT', label: 'Being loaded' },
    { value: 'DISPATCHED', label: 'Dispatched' },
    { value: 'IN_TRANSIT', label: 'In transit' },
    { value: 'ARRIVED', label: 'Arrived' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

const statusTone = (s: ConsignmentStatus) => {
    switch (s) {
        case 'ARRIVED': return { bg: alpha(statusTokens.success.main, 0.12), fg: statusTokens.success.strong };
        case 'IN_TRANSIT': return { bg: alpha(statusTokens.info.main, 0.12), fg: statusTokens.info.strong };
        case 'DISPATCHED': return { bg: alpha(statusTokens.warning.main, 0.14), fg: statusTokens.warning.strong };
        case 'CANCELLED': return { bg: alpha(statusTokens.danger.main, 0.1), fg: statusTokens.danger.strong };
        default: return { bg: alpha(brand[500], 0.1), fg: brand[700] };
    }
};

const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const Consignments = () => {
    const navigate = useNavigate();
    const [rows, setRows] = useState<IConsignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'all' | ConsignmentStatus>('all');
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

    const visible = useMemo(
        () => (tab === 'all' ? rows : rows.filter((r) => r.status === tab)),
        [rows, tab]
    );

    const counts = useMemo(() => ({
        loading: rows.filter((r) => r.status === 'DRAFT').length,
        moving: rows.filter((r) => r.status === 'DISPATCHED' || r.status === 'IN_TRANSIT').length,
        arrived: rows.filter((r) => r.status === 'ARRIVED').length,
    }), [rows]);

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

    return (
        <Box sx={{ minHeight: '100vh', pb: 4 }}>
            <PageHero
                title="Consignments"
                subtitle="One journey, many movements"
                icon={<LocalShippingOutlinedIcon />}
                stat={{ value: rows.length.toLocaleString(), label: 'journeys' }}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                <StatTile label="Being loaded" value={counts.loading} />
                <StatTile label="On the road" value={counts.moving} />
                <StatTile label="Arrived" value={counts.arrived} />
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ minHeight: 38, '& .MuiTab-root': { minHeight: 38, textTransform: 'none', fontWeight: 600 } }}
                >
                    {STATUS_TABS.map((t) => <Tab key={t.value} value={t.value} label={t.label} />)}
                </Tabs>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined" startIcon={<RefreshIcon />} onClick={load}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '999px' }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '999px' }}
                    >
                        New consignment
                    </Button>
                </Stack>
            </Stack>

            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', borderColor: border.subtle }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={26} /></Box>
                ) : visible.length === 0 ? (
                    <EmptyState
                        icon={<LocalShippingOutlinedIcon />}
                        title="No consignments here"
                        description="A consignment groups the movements travelling together on one courier run. Open one when you are ready to load a van."
                    />
                ) : (
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: neutral[50] }}>
                                    <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Route</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Courier</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="right">Movements</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Dispatched</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {visible.map((c) => {
                                    const tone = statusTone(c.status);
                                    const busy = busyId === c.id;
                                    return (
                                        <TableRow key={c.id} hover>
                                            <TableCell sx={{ fontWeight: 700, color: neutral[900] }}>
                                                {c.reference ?? `#${c.id}`}
                                            </TableCell>
                                            <TableCell sx={{ color: neutral[700] }}>
                                                {c.sourceLocation?.name ?? '—'} → {c.destLocation?.name ?? '—'}
                                            </TableCell>
                                            <TableCell sx={{ color: neutral[600] }}>
                                                {c.courierService ?? c.courier?.name ?? '—'}
                                                {c.plateNumber ? ` · ${c.plateNumber}` : ''}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: neutral[700] }}>{c.movementCount}</TableCell>
                                            <TableCell sx={{ color: neutral[600] }}>{formatDate(c.dispatchDate)}</TableCell>
                                            <TableCell>
                                                <Tooltip title={consignmentStatusHelp[c.status]}>
                                                    <Chip
                                                        size="small"
                                                        label={consignmentStatusLabels[c.status]}
                                                        sx={{ fontWeight: 700, fontSize: '0.7rem', bgcolor: tone.bg, color: tone.fg }}
                                                    />
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    <Tooltip title="Open">
                                                        <Button
                                                            size="small" onClick={() => openDetail(c.id)}
                                                            sx={{ minWidth: 0, textTransform: 'none' }}
                                                        >
                                                            <VisibilityOutlinedIcon fontSize="small" />
                                                        </Button>
                                                    </Tooltip>
                                                    {c.status === 'DISPATCHED' && (
                                                        <Tooltip title="Custody passes to the courier; stock leaves the source stores">
                                                            <Button
                                                                size="small" disabled={busy}
                                                                onClick={() => runAction(c.id, markConsignmentInTransitService, 'Consignment is in transit.')}
                                                                sx={{ textTransform: 'none', fontWeight: 600 }}
                                                                startIcon={<FlightTakeoffOutlinedIcon fontSize="small" />}
                                                            >
                                                                In transit
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                                    {c.status === 'ARRIVED' && (
                                                        <Tooltip title="Hand the landed items to their recipients">
                                                            <Button
                                                                size="small" variant="contained" disabled={busy}
                                                                onClick={() => openReceive(c.id)}
                                                                sx={{ textTransform: 'none', fontWeight: 600 }}
                                                                startIcon={<AssignmentTurnedInOutlinedIcon fontSize="small" />}
                                                            >
                                                                Hand over
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                                    {c.status === 'IN_TRANSIT' && (
                                                        <Tooltip title="Stock is credited to the destination store; hand-overs can begin">
                                                            <Button
                                                                size="small" disabled={busy}
                                                                onClick={() => runAction(c.id, markConsignmentArrivedService, 'Consignment arrived — stock is in the destination store.')}
                                                                sx={{ textTransform: 'none', fontWeight: 600 }}
                                                                startIcon={<WhereToVoteOutlinedIcon fontSize="small" />}
                                                            >
                                                                Arrived
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                                    {c.status === 'DRAFT' && (
                                                        <>
                                                            <Tooltip title={
                                                                c.movementCount === 0
                                                                    ? 'Load at least one movement before dispatching'
                                                                    : 'Hand the whole load to a courier'
                                                            }>
                                                                {/* span so the tooltip still shows while the button is disabled */}
                                                                <span>
                                                                    <Button
                                                                        size="small" variant="contained"
                                                                        disabled={busy || c.movementCount === 0}
                                                                        onClick={() => openDispatch(c.id)}
                                                                        sx={{ textTransform: 'none', fontWeight: 600 }}
                                                                        startIcon={<LocalShippingOutlinedIcon fontSize="small" />}
                                                                    >
                                                                        Dispatch
                                                                    </Button>
                                                                </span>
                                                            </Tooltip>
                                                            <Tooltip title="Releases its movements to travel another way">
                                                                <Button
                                                                    size="small" color="error" disabled={busy}
                                                                    onClick={() => runAction(c.id, (id) => cancelConsignmentService(id), 'Consignment cancelled.')}
                                                                    sx={{ textTransform: 'none', fontWeight: 600 }}
                                                                    startIcon={<CancelOutlinedIcon fontSize="small" />}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
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

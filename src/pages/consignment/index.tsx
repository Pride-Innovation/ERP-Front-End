/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useCallback, useEffect, useMemo, useState } from 'react';
import { RequirePermission } from '../../core/permissions';
import { PERMISSIONS } from '../../core/permissions/constants';
import { useNavigate } from 'react-router-dom';
import {
    alpha, Box, Button, Chip, Grid, IconButton, Paper, Stack, Tab, Tabs, Tooltip, Typography,
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
import { IConsignment, ConsignmentStatus, consignmentStatusLabels } from './interface';
import {
    fetchConsignmentsService, fetchConsignmentService, markConsignmentInTransitService,
    fetchConsignmentStatusCountsService, fetchConsignmentFilterOptionsService,
    markConsignmentArrivedService, cancelConsignmentService,
} from './service';
import ConsignmentTable, { ConsignmentAction } from './ConsignmentTable';
import ConsignmentFilters, {
    ConsignmentFilterValues,
} from './ConsignmentFilters';
import {
    exportConsignmentsPdf, exportConsignmentsExcel, exportConsignmentsCsv,
} from './exportConsignments';
import ConsignmentDetail from './ConsignmentDetail';
import CreateConsignment from './CreateConsignment';
import DispatchConsignment from './DispatchConsignment';
import ReceiveConsignment from './ReceiveConsignment';

/**
 * How many rows one export may pull.
 *
 * <p>High enough that every realistic filtered view fits in one file, bounded so a careless export
 * of the whole register cannot pull it into the browser's memory. The user is told when the cap
 * bites, because a silently truncated export is worse than a refused one.
 */
const EXPORT_LIMIT = 5000;

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

    /*
     * Everything below is asked of the server now.
     *
     * The page fetched the first hundred journeys once and did the rest in the browser: ten filters,
     * the tabs, their counts, the dropdown options and three exports. Past a hundred a journey
     * matching a filter exactly came back as "no results" — which reads exactly like "there is no
     * such consignment" — and the tab badges described a slice while claiming to describe the
     * register. The endpoint meanwhile declared two parameters and applied them in a ternary, so
     * choosing a status silently discarded the branch, and choosing neither returned the whole bank.
     */
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [total, setTotal] = useState(0);
    const [sort, setSort] = useState<{ column: string; order: 'asc' | 'desc' }>(
        { column: 'reference', order: 'desc' },
    );

    /** The table's column ids, translated to entity fields the query understands. */
    const SORT_FIELDS: Record<string, string> = {
        reference: 'id', schedule: 'dispatchDate', status: 'status',
    };
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
    /*
     * Counted separately because "overdue" is not a status.
     *
     * It is a journey on the road past its expected date, so it cuts across DISPATCHED and
     * IN_TRANSIT and cannot come out of the status tally. One extra count rather than a guess from
     * the loaded page, which is what it was.
     */
    const [overdueCount, setOverdueCount] = useState(0);
    const [filterOptions, setFilterOptions] = useState({
        sources: [] as string[], destinations: [] as string[], couriers: [] as string[],
    });

    /** The panel's filters as endpoint parameters; blank values are left out entirely. */
    const filterParams = useMemo(() => {
        const params: Record<string, any> = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params[key] = value;
        });
        return params;
    }, [filters]);

    /**
     * The tab as a status filter.
     *
     * <p>"On the road" spans two statuses, which is why the endpoint takes a list rather than one
     * value — comma-joined, because that is what Spring binds to a `List<Enum>` without ceremony.
     */
    const tabParams = useMemo(() => {
        if (tab === 'all') return {};
        if (tab === 'ON_ROAD') return { status: 'DISPATCHED,IN_TRANSIT' };
        return { status: tab };
    }, [tab]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = (await fetchConsignmentsService({
                ...filterParams,
                ...tabParams,
                pageNumber: page,
                pageSize: rowsPerPage,
                sortBy: SORT_FIELDS[sort.column] ?? 'id',
                sortDirection: sort.order,
            })) as any;

            if (res?.status === 200) {
                setRows(res.data?.content ?? []);
                setTotal(res.data?.totalElements ?? 0);
            } else {
                // Services answer `catch (error) { return error }`, so a failure arrives as a value
                // with no status. Left alone, the previous journeys stayed on screen under the new
                // filter's chips, looking like a successful match.
                setRows([]);
                setTotal(0);
            }

            // Counted without the tab, so each tab badge shows its own total rather than every tab
            // but the selected one reading zero.
            const counted: any = await fetchConsignmentStatusCountsService(filterParams);
            setStatusCounts(counted?.status === 200 ? (counted.data ?? {}) : {});

            // One row asked for, only the total read — the cheapest way to count a predicate the
            // status tally cannot express.
            const late: any = await fetchConsignmentsService({
                ...filterParams, timeliness: 'overdue', pageNumber: 0, pageSize: 1,
            });
            setOverdueCount(late?.status === 200 ? (late.data?.totalElements ?? 0) : 0);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterParams, tabParams, page, rowsPerPage, sort]);

    useEffect(() => { load(); }, [load]);

    // From the whole scoped register, and deliberately not narrowed by the active filters: choosing
    // a source would empty the destination list and the panel could never be widened again.
    useEffect(() => {
        fetchConsignmentFilterOptionsService().then((r: any) => {
            if (r?.status === 200 && r.data) setFilterOptions(r.data);
        });
    }, []);

    // Already filtered, tabbed, ordered and paged by the query that produced them.
    const visible = rows;

    /**
     * Exports cover every match, not the page on screen.
     *
     * <p>They ran over the loaded rows, so an export was silently partial — the worst kind, because
     * the file looks complete.
     */
    const handleExport = async (fn: (list: IConsignment[]) => void) => {
        const res: any = await fetchConsignmentsService({
            ...filterParams, ...tabParams, pageNumber: 0, pageSize: EXPORT_LIMIT,
        });
        const list: IConsignment[] = res?.status === 200 ? (res.data?.content ?? []) : [];

        if (list.length === 0) {
            toast.warning('There are no consignments matching the current filters to export.');
            return;
        }
        if ((res.data?.totalElements ?? 0) > list.length) {
            toast.info(`Exporting the first ${list.length.toLocaleString()} of `
                + `${res.data.totalElements.toLocaleString()} matches. Narrow the filters for the rest.`);
        }
        fn(list);
    };

    /** The hero tallies, over the whole filtered register rather than the page. */
    const counts = useMemo(() => ({
        loading: statusCounts.DRAFT ?? 0,
        moving: (statusCounts.DISPATCHED ?? 0) + (statusCounts.IN_TRANSIT ?? 0),
        arrived: statusCounts.ARRIVED ?? 0,
        overdue: overdueCount,
    }), [statusCounts, overdueCount]);

    const tabCounts = statusCounts;

    /** Every match across all statuses — what the "All" tab means now that a page is not the set. */
    const totalAcrossStatuses = useMemo(
        () => Object.values(statusCounts).reduce((sum, n) => sum + n, 0),
        [statusCounts],
    );

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
                        <RequirePermission permission={PERMISSIONS.CREATE_MOVEMENT}>
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
                        </RequirePermission>
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
                        const n = t.value === 'all' ? totalAcrossStatuses : (tabCounts[t.value] ?? 0);
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
                    server={{
                        page,
                        rowsPerPage,
                        total,
                        onPageChange: setPage,
                        onRowsPerPageChange: (size) => { setRowsPerPage(size); setPage(0); },
                        onSortChange: (column, order) => { setSort({ column, order }); setPage(0); },
                    }}
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
                                <RequirePermission permission={PERMISSIONS.CREATE_MOVEMENT}>
                                <Button
                                    variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}
                                    sx={{
                                        textTransform: 'none', borderRadius: '8px', fontWeight: 600,
                                        bgcolor: brand[500], '&:hover': { bgcolor: brand[700] },
                                    }}
                                >
                                    New Consignment
                                </Button>
                                </RequirePermission>
                            ) : undefined}
                        />
                    )}
                />
            </Paper>

            {detailOpen && detail && (
                <ModalComponent
                    title={`Consignment ${detail.reference ?? `#${detail.id}`}`}
                    icon={<LocalShippingOutlinedIcon />}
                    // The route is what identifies a consignment in conversation; the reference
                    // alone makes the reader open the body to find out which journey this is.
                    subtitle={`${detail.sourceLocation?.name ?? '—'} → ${detail.destLocation?.name ?? '—'}`
                        + ` · ${detail.movementCount} movement${detail.movementCount === 1 ? '' : 's'}`}
                    headerAction={(
                        <Chip
                            size="small"
                            label={consignmentStatusLabels[detail.status]}
                            sx={{
                                height: 22, fontSize: '0.68rem', fontWeight: 700,
                                bgcolor: alpha(brand[500], 0.1), color: brand[700],
                            }}
                        />
                    )}
                    open={detailOpen}
                    handleClose={() => setDetailOpen(false)}
                    // Wide enough that the journey cards keep their one-line shape, capped so the
                    // facts grid above them doesn't stretch into four lonely columns on a big screen.
                    width="60%"
                    maxWidth={980}
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

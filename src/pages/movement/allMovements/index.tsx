import { RequirePermission } from '../../../core/permissions';
import { PERMISSIONS } from '../../../core/permissions/constants';
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
import {
    fetchMovementStatusCountsService, fetchMovementFilterOptionsService,
} from '../service';
import { fetchRowsService } from '../../../core/apis/globalService';

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
    MovementFilterValues,
} from './MovementFilters';
import { exportMovementsPdf, exportMovementsExcel, exportMovementsCsv } from './exportMovements';
import { IMovement } from '../interface';
import RoutesUtills from '../../../core/routes/utills';
/**
 * How many rows one export may pull.
 *
 * <p>High enough that every realistic filtered view fits in one file, bounded so a careless export
 * of the whole register cannot pull the table into the browser's memory. The user is told when the
 * cap bites, because a silently truncated export is worse than a refused one.
 */
const EXPORT_LIMIT = 5000;

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

    /*
     * Everything below is asked of the server now.
     *
     * This page fetched the first hundred movements once and did the rest in the browser — eleven
     * filters, the sort, the paging, three exports and five tiles. Past a hundred rows the register
     * stopped: a movement matching a filter exactly came back as "no results", which reads exactly
     * like "there is no such movement", and the tiles under-reported against the total printed
     * above them. `GET /movements` now declares every filter, so there is something to ask.
     */
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [sort, setSort] = useState<{ column: string; order: 'asc' | 'desc' }>(
        { column: 'date', order: 'desc' },
    );

    /** The column ids the table sorts by, translated to entity fields the query understands. */
    const SORT_FIELDS: Record<string, string> = {
        ref: 'id', date: 'createDate', status: 'status', type: 'movementType',
    };

    /** Filters + status tab as the endpoint's parameters. Blank values are left out entirely. */
    const queryParams = useMemo(() => {
        const params: Record<string, any> = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params[key] = value;
        });
        // The tab is the same `status` filter; the tab wins because the panel cannot show it.
        if (statusTab !== 'all') params.status = statusTab;
        return params;
    }, [filters, statusTab]);

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

    /** The panel's filters without the tab — what the tab labels and the tiles are counted over. */
    const countParams = useMemo(() => {
        const params: Record<string, any> = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params[key] = value;
        });
        return params;
    }, [filters]);


    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

    /** Every match across all statuses — what the "All" tab means now that a page is not the set. */
    const totalAcrossStatuses = useMemo(
        () => Object.values(statusCounts).reduce((sum, n) => sum + n, 0),
        [statusCounts],
    );
    const [filterOptions, setFilterOptions] = useState({
        sources: [] as string[], destinations: [] as string[],
        couriers: [] as string[], initiators: [] as string[],
    });

    const load = useCallback(() => {
        fetchAllMovements({
            ...queryParams,
            pageNumber: page,
            pageSize: rowsPerPage,
            sortBy: SORT_FIELDS[sort.column] ?? 'createDate',
            sortDirection: sort.order,
        });
        /*
         * Counts follow the panel's filters and neither the paging nor the status tab.
         *
         * Not the paging, because the tiles describe the whole matching set rather than the page in
         * front of the user, and must not move as they page. Not the tab, because each tab is
         * labelled with its own count — narrowing by the selected tab would leave every other tab
         * reading zero, and the one you are on reading the total.
         */
        fetchMovementStatusCountsService(countParams).then((r: any) => {
            setStatusCounts(r?.status === 200 ? (r.data ?? {}) : {});
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams, countParams, page, rowsPerPage, sort]);

    useEffect(() => { load(); }, [load]);

    // Options come from the whole scoped register, once — deliberately not narrowed by the current
    // filters, or choosing a source would empty the destination list and the panel could never be
    // widened again.
    useEffect(() => {
        fetchMovementFilterOptionsService().then((r: any) => {
            if (r?.status === 200 && r.data) setFilterOptions(r.data);
        });
    }, []);

    const refresh = () => load();

    // Already filtered, sorted and paged by the query that produced them.
    const filtered = movements;

    /**
     * Exports cover every match, not the page on screen.
     *
     * <p>They ran over the loaded rows, so an export was silently a partial one — the worst kind,
     * because the file looks complete. Fetched fresh under the same filters with the paging removed.
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
                onExportPdf={() => handleExport((rows) => exportMovementsPdf(rows, { filters: exportFilterStrip }))}
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
                        // `movements.length` used to be the whole set and is now one page, so the
                        // All tab would have counted 15 however large the register is.
                        const n = t.value === 'all' ? totalAcrossStatuses : (statusCounts[t.value] ?? 0);
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
                    server={{
                        page,
                        rowsPerPage,
                        total: count ?? 0,
                        onPageChange: setPage,
                        onRowsPerPageChange: (size) => { setRowsPerPage(size); setPage(0); },
                        onSortChange: (column, order) => { setSort({ column, order }); setPage(0); },
                    }}
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

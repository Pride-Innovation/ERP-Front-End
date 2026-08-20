/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    alpha,
    Box,
    Button,
    Chip,
    Collapse,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import { IAuditTrail, IAuditTrailSummary } from './interface';
import {
    fetchAuditTrailsService, fetchAuditTrailSummaryService, recordExportService,
} from './service';
import { SummaryCard } from '../reports/ReportSummaryCards';
import ReportDataTable, { ReportColumn } from '../reports/ReportDataTable';
import { exportReportPdf, exportReportExcel, exportReportCsv } from '../reports/exportReport';
import { PageHero } from '../../components/layout';

const PRIMARY = '#08796C';

const PILL_INPUT_SX = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        bgcolor: '#fff',
        fontSize: '0.8rem',
        height: 36,
        '& fieldset': { borderColor: '#E2E8F0' },
        '&:hover fieldset': { borderColor: PRIMARY },
        '&.Mui-focused fieldset': { borderColor: PRIMARY },
    },
};

const FIELD_LABEL_SX = { fontSize: '0.72rem', fontWeight: 600, color: '#64748B', mb: 0.5, textTransform: 'uppercase' as const, letterSpacing: '0.05em' };

// ── Event type config ─────────────────────────────────────────────────────
const EVENT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    created:  { label: 'Created',  color: '#15803D', bg: '#DCFCE7' },
    updated:  { label: 'Updated',  color: '#1D4ED8', bg: '#DBEAFE' },
    deleted:  { label: 'Deleted',  color: '#DC2626', bg: '#FEE2E2' },
    login:    { label: 'Login',    color: '#065F46', bg: '#D1FAE5' },
    logout:   { label: 'Logout',   color: '#7C3AED', bg: '#EDE9FE' },
    approved: { label: 'Approved', color: '#0891B2', bg: '#CFFAFE' },
    rejected: { label: 'Rejected', color: '#BE123C', bg: '#FFE4E6' },
    system:   { label: 'System',   color: '#475569', bg: '#F1F5F9' },
};

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    info:     { label: 'Info',     color: '#1D4ED8', bg: '#DBEAFE' },
    warning:  { label: 'Warning',  color: '#D97706', bg: '#FEF3C7' },
    critical: { label: 'Critical', color: '#DC2626', bg: '#FEE2E2' },
};

const MODULE_COLORS: Record<string, string> = {
    Assets: '#059669', Inventory: '#0369A1', Users: '#7C3AED',
    Store: '#D97706', Requests: '#DB2777', Movement: '#0891B2',
    Disposal: '#DC2626', Maintenance: '#78350F', System: '#475569',
};

// ── Cell renderers ────────────────────────────────────────────────────────
const EventChip = ({ value }: { value: string }) => {
    const cfg = EVENT_CONFIG[value] ?? { label: value, color: '#475569', bg: '#F1F5F9' };
    return (
        <Chip
            label={cfg.label}
            size="small"
            sx={{
                bgcolor: cfg.bg, color: cfg.color, fontWeight: 700,
                fontSize: '0.7rem', height: 22,
                border: `1px solid ${alpha(cfg.color, 0.25)}`,
            }}
        />
    );
};

const SeverityChip = ({ value }: { value: string }) => {
    const cfg = SEVERITY_CONFIG[value] ?? { label: value, color: '#475569', bg: '#F1F5F9' };
    return (
        <Chip
            label={cfg.label}
            size="small"
            sx={{
                bgcolor: cfg.bg, color: cfg.color, fontWeight: 700,
                fontSize: '0.7rem', height: 22,
                border: `1px solid ${alpha(cfg.color, 0.25)}`,
            }}
        />
    );
};

const ModuleChip = ({ value }: { value: string }) => {
    const color = MODULE_COLORS[value] ?? '#475569';
    return (
        <Chip
            label={value}
            size="small"
            sx={{
                bgcolor: alpha(color, 0.1), color,
                fontWeight: 600, fontSize: '0.7rem', height: 22,
            }}
        />
    );
};

const ActorCell = ({ name }: { name: string }) => {
    // Live rows can carry an actor the server could not name — an unauthenticated call, a seeder.
    // The mock never could, and `name.split` on undefined would take the whole table down.
    const safeName = name?.trim() || 'System';
    const initials = safeName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const hash = safeName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const colors = ['#0369A1', '#059669', '#7C3AED', '#D97706', '#DC2626', '#0891B2', '#DB2777'];
    const color = colors[hash % colors.length];
    return (
        <Stack direction="row" alignItems="center" gap={1}>
            <Box sx={{
                width: 28, height: 28, borderRadius: '50%',
                bgcolor: alpha(color, 0.12), color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
            }}>
                {initials}
            </Box>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#1E293B', whiteSpace: 'nowrap' }}>
                {safeName}
            </Typography>
        </Stack>
    );
};

/**
 * "13 Apr 2026, 09:42:17".
 *
 * Seconds are kept deliberately: an audit trail is read to establish order, and three events in the
 * same minute are common enough that minute precision would leave that unanswerable.
 */
const fmtTimestamp = (value?: string) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, `
        + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// ── Table column definitions ──────────────────────────────────────────────
const COLUMNS: ReportColumn<IAuditTrail>[] = [
    { id: 'timeStamp',   label: 'Timestamp',   minWidth: 160, format: (v) => fmtTimestamp(v) },
    { id: 'event',       label: 'Event',        minWidth: 110, format: (v) => <EventChip value={v} /> },
    { id: 'module',      label: 'Module',       minWidth: 120, format: (v) => <ModuleChip value={v} /> },
    { id: 'actor',       label: 'Actor',        minWidth: 160, format: (v) => <ActorCell name={v} /> },
    { id: 'description', label: 'Description',  minWidth: 280 },
    { id: 'ipAddress',   label: 'IP Address',   minWidth: 130 },
    { id: 'severity',    label: 'Severity',     minWidth: 100, format: (v) => <SeverityChip value={v} /> },
];

const ALL_EVENTS    = ['All', 'created', 'updated', 'deleted', 'login', 'logout', 'approved', 'rejected', 'system'];
const ALL_MODULES   = ['All', 'Assets', 'Inventory', 'Users', 'Store', 'Requests', 'Movement', 'Disposal', 'Maintenance', 'System'];
const ALL_SEVERITIES = ['All', 'info', 'warning', 'critical'];

/** How often the "Live" badge refetches while it is switched on. */
const LIVE_POLL_MS = 30_000;

/** Rows fetched for an export — more than a page, capped so a click can't pull the whole table. */
const EXPORT_PAGE_SIZE = 1000;

// ── Main component ────────────────────────────────────────────────────────
const AuditTrails = () => {
    const [showFilters, setShowFilters]     = useState(true);

    /*
     * Two sets of filter state.
     *
     * The inputs are what the user is typing; `applied` is what the last Apply committed and what the
     * query actually uses. Keeping them apart is what makes Apply mean something — with one set, every
     * keystroke would fire a request against the largest table in the database.
     */
    const [search, setSearch]               = useState('');
    const [dateFrom, setDateFrom]           = useState('');
    const [dateTo, setDateTo]               = useState('');
    const [eventType, setEventType]         = useState('All');
    const [moduleFilter, setModuleFilter]   = useState('All');
    const [severityFilter, setSeverityFilter] = useState('All');

    const [applied, setApplied] = useState({
        search: '', dateFrom: '', dateTo: '', eventType: 'All', module: 'All', severity: 'All',
    });

    const [rows, setRows] = useState<IAuditTrail[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<IAuditTrailSummary | null>(null);
    const [live, setLive] = useState(false);
    const [exporting, setExporting] = useState(false);

    const todayLabel = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    /**
     * Fetches the current page.
     *
     * `background` distinguishes a poll from a deliberate look. The server records who reads the
     * audit trail, and a tab left open on a thirty-second refresh would otherwise write nearly three
     * thousand "viewed the audit trail" rows a day and bury everything the log is for.
     */
    const load = useCallback(async (background = false) => {
        if (!background) setLoading(true);
        try {
            const [pageData, summaryData] = await Promise.all([
                fetchAuditTrailsService({
                    search: applied.search,
                    dateFrom: applied.dateFrom,
                    dateTo: applied.dateTo,
                    eventType: applied.eventType,
                    module: applied.module,
                    severity: applied.severity,
                    pageNumber: page,
                    pageSize: rowsPerPage,
                    background,
                }),
                fetchAuditTrailSummaryService(),
            ]);
            setRows(pageData.rows);
            setTotal(pageData.totalElements);
            setSummary(summaryData);
            setError(null);
        } catch {
            // Not cleared to an empty array: "we could not ask" and "nothing happened" are opposite
            // statements, and on an audit trail the difference matters.
            setError('Could not load the audit trail. Please try again.');
        } finally {
            if (!background) setLoading(false);
        }
    }, [applied, page, rowsPerPage]);

    useEffect(() => { load(); }, [load]);

    // Keep the poll pointed at the current filters without making the interval depend on them —
    // re-creating the timer on every filter change would reset the countdown each time.
    const loadRef = useRef(load);
    loadRef.current = load;

    useEffect(() => {
        if (!live) return undefined;
        const timer = setInterval(() => loadRef.current(true), LIVE_POLL_MS);
        return () => clearInterval(timer);
    }, [live]);

    const applyFilters = () => {
        setPage(0); // a filtered result has different pages; page 3 of the old query means nothing
        setApplied({
            search, dateFrom, dateTo,
            eventType, module: moduleFilter, severity: severityFilter,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        setEventType('All');
        setModuleFilter('All');
        setSeverityFilter('All');
        setPage(0);
        setApplied({ search: '', dateFrom: '', dateTo: '', eventType: 'All', module: 'All', severity: 'All' });
    };

    /**
     * Exports what the filters describe, not what is on screen.
     *
     * The table holds one page; exporting that would silently produce a file of twenty-five rows
     * from a filter matching thousands. So the rows are refetched — capped, because an unbounded
     * export of this table would be a denial of service with a button on it.
     */
    const runExport = async (kind: 'pdf' | 'excel' | 'csv') => {
        setExporting(true);
        try {
            const { rows: exportRows } = await fetchAuditTrailsService({
                search: applied.search,
                dateFrom: applied.dateFrom,
                dateTo: applied.dateTo,
                eventType: applied.eventType,
                module: applied.module,
                severity: applied.severity,
                pageNumber: 0,
                pageSize: EXPORT_PAGE_SIZE,
                background: true, // the export itself is recorded below; don't also log a "view"
            });

            // Timestamps and chips are React nodes in the table; a file needs the text.
            const flat = exportRows.map((r) => ({
                ...r,
                timeStamp: fmtTimestamp(r.timeStamp),
                event: EVENT_CONFIG[r.event]?.label ?? r.event,
                severity: SEVERITY_CONFIG[r.severity]?.label ?? r.severity,
            }));

            const input = { title: 'Audit Trail', columns: COLUMNS, rows: flat };
            if (kind === 'pdf') await exportReportPdf(input);
            else if (kind === 'excel') exportReportExcel(input);
            else exportReportCsv(input);

            recordExportService({
                module: 'System',
                reportName: 'Audit Trail',
                format: kind === 'pdf' ? 'PDF' : kind === 'excel' ? 'Excel' : 'CSV',
                rowCount: flat.length,
            });
        } catch {
            setError('Could not build the export. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    return (
        // Same page padding as PageShell / the movement pages so all modules align.
        <Box sx={{ minHeight: '100vh', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, pb: 4 }}>
            <PageHero
                title="Audit Trails"
                subtitle="System activity log"
                icon={<HistoryOutlinedIcon />}
                stat={{
                    value: (summary?.totalEvents ?? 0).toLocaleString(),
                    label: 'events',
                    helper: todayLabel,
                }}
                actions={
                    // The badge was decorative over static data. Now it is a switch: on, the page
                    // refetches every 30 seconds and the pulse means something; off, it is grey and
                    // the page holds still.
                    <Tooltip title={live
                        ? `Live — refreshing every ${LIVE_POLL_MS / 1000}s. Click to pause.`
                        : 'Paused. Click to refresh automatically.'}>
                        <Chip
                            label={live ? 'Live' : 'Paused'}
                            size="small"
                            onClick={() => setLive(p => !p)}
                            sx={{
                                bgcolor: live ? '#22C55E' : '#94A3B8', color: '#fff', fontWeight: 700,
                                fontSize: '0.72rem', cursor: 'pointer',
                                ...(live && {
                                    animation: 'pulse 2s infinite',
                                    '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.55 } },
                                }),
                                '&:hover': { bgcolor: live ? '#16A34A' : '#64748B' },
                            }}
                        />
                    </Tooltip>
                }
            />

            <Box>

                {/* ── KPI Cards ─────────────────────────────────────────── */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        {/* Counted server-side across the whole table. With the list paged in SQL the
                            page holds 25 rows and could not derive any of these from what it was sent. */}
                        <SummaryCard
                            label="Total Events"
                            value={summary?.totalEvents ?? 0}
                            subLabel="All recorded activities"
                            icon={<ListAltOutlinedIcon />}
                            color={PRIMARY}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            label="Events Today"
                            value={summary?.eventsToday ?? 0}
                            subLabel={todayLabel}
                            icon={<TodayOutlinedIcon />}
                            color="#0369A1"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            label="Active Users"
                            value={summary?.activeActors ?? 0}
                            subLabel="Distinct actors today"
                            icon={<PeopleAltOutlinedIcon />}
                            color="#7C3AED"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            label="Flagged Events"
                            value={summary?.flaggedEvents ?? 0}
                            subLabel="Warning & critical"
                            icon={<WarningAmberOutlinedIcon />}
                            color="#DC2626"
                        />
                    </Grid>
                </Grid>

                {/* ── Filter Bar ────────────────────────────────────────── */}
                <Box sx={{
                    bgcolor: '#fff',
                    border: '1px solid #EEF2F7',
                    borderRadius: 2,
                    mb: 2.5,
                    overflow: 'hidden',
                }}>
                    {/* Panel header */}
                    <Box sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        px: 2.5, py: 1.5,
                        borderBottom: showFilters ? '1px solid #EEF2F7' : 'none',
                        bgcolor: alpha(PRIMARY, 0.03),
                    }}>
                        <Stack direction="row" alignItems="center" gap={1}>
                            <TuneOutlinedIcon sx={{ fontSize: 16, color: PRIMARY }} />
                            <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>
                                Filters &amp; Options
                            </Typography>
                        </Stack>
                        <Tooltip title={showFilters ? 'Collapse filters' : 'Expand filters'}>
                            <IconButton size="small" onClick={() => setShowFilters(p => !p)}
                                sx={{ color: '#64748B' }}>
                                <FilterAltOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Collapse in={showFilters}>
                        <Box sx={{ px: 2.5, py: 2 }}>
                            <Grid container spacing={1.5} alignItems="flex-end">

                                {/* Search */}
                                <Grid item xs={12} md={4}>
                                    <Typography sx={FIELD_LABEL_SX}>Search</Typography>
                                    <TextField
                                        fullWidth size="small"
                                        placeholder="Description, actor, module, event…"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        // Enter is what a search box is expected to do; without it
                                        // the user types and nothing happens until they find Apply.
                                        onKeyDown={e => { if (e.key === 'Enter') applyFilters(); }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchOutlinedIcon sx={{ fontSize: 15, color: '#94A3B8' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={PILL_INPUT_SX}
                                    />
                                </Grid>

                                {/* Date From */}
                                <Grid item xs={6} sm={3} md={1.5}>
                                    <Typography sx={FIELD_LABEL_SX}>From</Typography>
                                    <TextField
                                        fullWidth size="small" type="date"
                                        value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                                        sx={PILL_INPUT_SX}
                                    />
                                </Grid>

                                {/* Date To */}
                                <Grid item xs={6} sm={3} md={1.5}>
                                    <Typography sx={FIELD_LABEL_SX}>To</Typography>
                                    <TextField
                                        fullWidth size="small" type="date"
                                        value={dateTo} onChange={e => setDateTo(e.target.value)}
                                        sx={PILL_INPUT_SX}
                                    />
                                </Grid>

                                {/* Event Type */}
                                <Grid item xs={12} sm={6} md={2}>
                                    <Typography sx={FIELD_LABEL_SX}>Event Type</Typography>
                                    <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                        <Select value={eventType} onChange={e => setEventType(e.target.value)} displayEmpty>
                                            <MenuItem value="All"><em style={{ fontSize: '0.8rem', fontStyle: 'normal', color: '#94A3B8' }}>All Events</em></MenuItem>
                                            {ALL_EVENTS.filter(e => e !== 'All').map(e => (
                                                <MenuItem key={e} value={e} sx={{ fontSize: '0.8rem' }}>
                                                    {EVENT_CONFIG[e]?.label ?? e}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Module */}
                                <Grid item xs={12} sm={6} md={2}>
                                    <Typography sx={FIELD_LABEL_SX}>Module</Typography>
                                    <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                        <Select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} displayEmpty>
                                            <MenuItem value="All"><em style={{ fontSize: '0.8rem', fontStyle: 'normal', color: '#94A3B8' }}>All Modules</em></MenuItem>
                                            {ALL_MODULES.filter(m => m !== 'All').map(m => (
                                                <MenuItem key={m} value={m} sx={{ fontSize: '0.8rem' }}>{m}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Severity */}
                                <Grid item xs={12} sm={6} md={2}>
                                    <Typography sx={FIELD_LABEL_SX}>Severity</Typography>
                                    <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                        <Select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} displayEmpty>
                                            <MenuItem value="All"><em style={{ fontSize: '0.8rem', fontStyle: 'normal', color: '#94A3B8' }}>All Severities</em></MenuItem>
                                            {ALL_SEVERITIES.filter(s => s !== 'All').map(s => (
                                                <MenuItem key={s} value={s} sx={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>
                                                    {SEVERITY_CONFIG[s]?.label ?? s}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Action buttons */}
                                <Grid item xs={12} sm="auto">
                                    <Stack direction="row" gap={1} sx={{ mt: { xs: 0.5, md: 0 } }}>
                                        <Button
                                            size="small" variant="contained"
                                            onClick={applyFilters}
                                            sx={{
                                                height: 36, px: 2, textTransform: 'none', fontWeight: 600,
                                                fontSize: '0.8rem', bgcolor: PRIMARY, borderRadius: '8px',
                                                boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.35)}`,
                                                '&:hover': { bgcolor: alpha(PRIMARY, 0.85), boxShadow: `0 4px 14px ${alpha(PRIMARY, 0.4)}` },
                                            }}
                                        >
                                            Apply
                                        </Button>
                                        <Button
                                            size="small" variant="outlined"
                                            onClick={clearFilters}
                                            sx={{
                                                height: 36, px: 1.5, textTransform: 'none', fontWeight: 600,
                                                fontSize: '0.8rem', borderRadius: '8px',
                                                borderColor: '#CBD5E1', color: '#64748B',
                                                '&:hover': { borderColor: PRIMARY, color: PRIMARY, bgcolor: alpha(PRIMARY, 0.04) },
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    </Stack>
                                </Grid>

                            </Grid>
                        </Box>
                    </Collapse>
                </Box>

                {/* ── Result count + Export ─────────────────────────────── */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                        Showing{' '}
                        <Box component="span" sx={{ fontWeight: 700, color: '#0F172A' }}>{rows.length}</Box>
                        {' '}of{' '}
                        <Box component="span" sx={{ fontWeight: 700, color: '#0F172A' }}>{total.toLocaleString()}</Box>
                        {' '}matching records
                    </Typography>

                    <Stack direction="row" alignItems="center" gap={1}>
                        {/* <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mr: 0.5 }}>Export as:</Typography> */}

                        <Tooltip title="Export PDF">
                            <Button
                                size="small" variant="outlined"
                                startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                                disabled={exporting}
                                onClick={() => runExport('pdf')}
                                sx={{
                                    height: 32, px: 1.5, borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
                                    textTransform: 'none', borderColor: '#E2E8F0', color: '#DC2626',
                                    '&:hover': { borderColor: '#DC2626', bgcolor: alpha('#DC2626', 0.04) },
                                }}
                            >
                                PDF
                            </Button>
                        </Tooltip>

                        <Tooltip title="Export Excel">
                            <Button
                                size="small" variant="outlined"
                                startIcon={<TableChartOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                                disabled={exporting}
                                onClick={() => runExport('excel')}
                                sx={{
                                    height: 32, px: 1.5, borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
                                    textTransform: 'none', borderColor: '#E2E8F0', color: '#15803D',
                                    '&:hover': { borderColor: '#15803D', bgcolor: alpha('#15803D', 0.04) },
                                }}
                            >
                                Excel
                            </Button>
                        </Tooltip>

                        <Tooltip title="Export CSV">
                            <Button
                                size="small" variant="outlined"
                                startIcon={<DataObjectOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                                disabled={exporting}
                                onClick={() => runExport('csv')}
                                sx={{
                                    height: 32, px: 1.5, borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
                                    textTransform: 'none', borderColor: '#E2E8F0', color: '#0369A1',
                                    '&:hover': { borderColor: '#0369A1', bgcolor: alpha('#0369A1', 0.04) },
                                }}
                            >
                                CSV
                            </Button>
                        </Tooltip>

                        <Box sx={{ width: 1, height: 24, bgcolor: '#E2E8F0', mx: 0.5 }} />

                        <Tooltip title="Refresh data">
                            {/* Refetches with the filters intact. It used to call clearFilters,
                                which discarded the user's query rather than refreshing it. */}
                            <IconButton size="small"
                                sx={{
                                    width: 32, height: 32, border: '1px solid #E2E8F0', borderRadius: '8px',
                                    color: '#64748B',
                                    '&:hover': { borderColor: PRIMARY, color: PRIMARY, bgcolor: alpha(PRIMARY, 0.05) },
                                }}
                                onClick={() => load()}
                            >
                                <RefreshOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>

                {/* ── Data Table ───────────────────────────────────────── */}
                <ReportDataTable
                    columns={COLUMNS}
                    rows={rows}
                    accentColor={PRIMARY}
                    rowKey="id"
                    loading={loading}
                    error={error}
                    emptyMessage="No activity matches these filters."
                    // Paged in SQL — see the service. `rows` is exactly the page to show.
                    totalCount={total}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }}
                />
            </Box>
        </Box>
    );
};

export default AuditTrails;

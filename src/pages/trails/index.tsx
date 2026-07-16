/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState, useMemo } from 'react';
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
import { auditTrailsMock } from '../../mocks/trails';
import { IAuditTrail } from './interface';
import { SummaryCard } from '../reports/ReportSummaryCards';
import ReportDataTable, { ReportColumn } from '../reports/ReportDataTable';
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
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
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
                {name}
            </Typography>
        </Stack>
    );
};

// ── Table column definitions ──────────────────────────────────────────────
const COLUMNS: ReportColumn<IAuditTrail>[] = [
    { id: 'timeStamp',   label: 'Timestamp',   minWidth: 160 },
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

// ── Main component ────────────────────────────────────────────────────────
const AuditTrails = () => {
    const [showFilters, setShowFilters]     = useState(true);
    const [search, setSearch]               = useState('');
    const [dateFrom, setDateFrom]           = useState('');
    const [dateTo, setDateTo]               = useState('');
    const [eventType, setEventType]         = useState('All');
    const [moduleFilter, setModuleFilter]   = useState('All');
    const [severityFilter, setSeverityFilter] = useState('All');

    const todayLabel = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const todayCount    = auditTrailsMock.filter(t => t.timeStamp.startsWith('Apr 13')).length;
    const uniqueActors  = new Set(auditTrailsMock.map(t => t.actor)).size;
    const flaggedCount  = auditTrailsMock.filter(t => t.severity !== 'info').length;

    const filtered = useMemo(() => {
        let data = [...auditTrailsMock];
        if (search) {
            const q = search.toLowerCase();
            data = data.filter(r =>
                r.description.toLowerCase().includes(q) ||
                r.actor.toLowerCase().includes(q) ||
                r.event.toLowerCase().includes(q) ||
                r.module.toLowerCase().includes(q)
            );
        }
        if (eventType !== 'All')    data = data.filter(r => r.event === eventType);
        if (moduleFilter !== 'All') data = data.filter(r => r.module === moduleFilter);
        if (severityFilter !== 'All') data = data.filter(r => r.severity === severityFilter);
        return data;
    }, [search, eventType, moduleFilter, severityFilter]);

    const clearFilters = () => {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        setEventType('All');
        setModuleFilter('All');
        setSeverityFilter('All');
    };

    return (
        // Same page padding as PageShell / the movement pages so all modules align.
        <Box sx={{ minHeight: '100vh', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, pb: 4 }}>
            <PageHero
                title="Audit Trails"
                subtitle="System activity log"
                icon={<HistoryOutlinedIcon />}
                stat={{
                    value: auditTrailsMock.length.toLocaleString(),
                    label: 'events',
                    helper: todayLabel,
                }}
                actions={
                    <Chip
                        label="Live"
                        size="small"
                        sx={{
                            bgcolor: '#22C55E', color: '#fff', fontWeight: 700, fontSize: '0.72rem',
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.55 } },
                        }}
                    />
                }
            />

            <Box>

                {/* ── KPI Cards ─────────────────────────────────────────── */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            label="Total Events"
                            value={auditTrailsMock.length}
                            subLabel="All recorded activities"
                            icon={<ListAltOutlinedIcon />}
                            color={PRIMARY}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            label="Events Today"
                            value={todayCount}
                            subLabel="Apr 13, 2026"
                            icon={<TodayOutlinedIcon />}
                            color="#0369A1"
                            trend={8}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            label="Active Users"
                            value={uniqueActors}
                            subLabel="Distinct actors logged"
                            icon={<PeopleAltOutlinedIcon />}
                            color="#7C3AED"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <SummaryCard
                            label="Flagged Events"
                            value={flaggedCount}
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
                                            onClick={() => {}}
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
                        <Box component="span" sx={{ fontWeight: 700, color: '#0F172A' }}>{filtered.length}</Box>
                        {' '}of{' '}
                        <Box component="span" sx={{ fontWeight: 700, color: '#0F172A' }}>{auditTrailsMock.length}</Box>
                        {' '}records
                    </Typography>

                    <Stack direction="row" alignItems="center" gap={1}>
                        {/* <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mr: 0.5 }}>Export as:</Typography> */}

                        <Tooltip title="Export PDF">
                            <Button
                                size="small" variant="outlined"
                                startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                                onClick={() => alert('Export PDF — connect to API')}
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
                                onClick={() => alert('Export Excel — connect to API')}
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
                                onClick={() => alert('Export CSV — connect to API')}
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
                            <IconButton size="small"
                                sx={{
                                    width: 32, height: 32, border: '1px solid #E2E8F0', borderRadius: '8px',
                                    color: '#64748B',
                                    '&:hover': { borderColor: PRIMARY, color: PRIMARY, bgcolor: alpha(PRIMARY, 0.05) },
                                }}
                                onClick={clearFilters}
                            >
                                <RefreshOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>

                {/* ── Data Table ───────────────────────────────────────── */}
                <ReportDataTable
                    columns={COLUMNS}
                    rows={filtered}
                    accentColor={PRIMARY}
                    rowKey="id"
                />
            </Box>
        </Box>
    );
};

export default AuditTrails;

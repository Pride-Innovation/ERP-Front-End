/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from 'react';
import {
    alpha, Box, Button, Collapse, FormControl, Grid, IconButton, InputAdornment,
    MenuItem, Select, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import dayjs from 'dayjs';
import { brand } from '../../utils/tokens';
import { IConsignment, ConsignmentStatus, consignmentStatusLabels } from './interface';

const PRIMARY = brand[500];

/** Values collected by the consignments filter panel — applied client-side on the loaded list. */
export interface ConsignmentFilterValues {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    source?: string;
    destination?: string;
    courier?: string;
    trackingNumber?: string;
    plateNumber?: string;
    /** `overdue` / `on-time`, judged against the expected delivery date. */
    timeliness?: string;
    /** `loaded` / `empty` — a draft with nothing on it cannot be dispatched. */
    load?: string;
}

// ── Shared predicate + option derivation ──────────────────────────────────

export const consignmentCourierName = (c: IConsignment) => c.courierService ?? c.courier?.name ?? '';

export const hasActiveConsignmentFilters = (f: ConsignmentFilterValues) => Object.values(f).some(Boolean);

const isOverdue = (c: IConsignment) => {
    if (c.status !== 'DISPATCHED' && c.status !== 'IN_TRANSIT') return false;
    if (!c.expectedDeliveryDate) return false;
    const due = new Date(c.expectedDeliveryDate);
    return !Number.isNaN(due.getTime()) && due.getTime() < Date.now();
};

/** Applies the panel's values to a consignment — every set field must match (AND). */
export const matchesConsignmentFilters = (c: IConsignment, f: ConsignmentFilterValues): boolean => {
    // Dated on the journey itself where there is one, else on when it was opened.
    const timelineDate = c.dispatchDate ?? c.createDate;
    if (f.dateFrom && (!timelineDate || new Date(timelineDate) < new Date(f.dateFrom))) return false;
    if (f.dateTo && (!timelineDate || new Date(timelineDate) > new Date(f.dateTo))) return false;
    if (f.status && c.status !== f.status) return false;
    if (f.source && c.sourceLocation?.name !== f.source) return false;
    if (f.destination && c.destLocation?.name !== f.destination) return false;
    if (f.courier && consignmentCourierName(c) !== f.courier) return false;
    if (f.trackingNumber && !c.trackingNumber?.toLowerCase().includes(f.trackingNumber.toLowerCase())) return false;
    if (f.plateNumber && !c.plateNumber?.toLowerCase().includes(f.plateNumber.toLowerCase())) return false;
    if (f.timeliness === 'overdue' && !isOverdue(c)) return false;
    if (f.timeliness === 'on-time' && isOverdue(c)) return false;
    if (f.load === 'loaded' && c.movementCount === 0) return false;
    if (f.load === 'empty' && c.movementCount > 0) return false;
    return true;
};

const unique = (values: Array<string | undefined | null>) =>
    Array.from(new Set(values.filter((v): v is string => !!v && v !== '—'))).sort();

/** Unique dropdown option lists derived from the loaded consignments. */
export const deriveConsignmentFilterOptions = (consignments: IConsignment[]) => ({
    sources: unique(consignments.map((c) => c.sourceLocation?.name)),
    destinations: unique(consignments.map((c) => c.destLocation?.name)),
    couriers: unique(consignments.map(consignmentCourierName)),
});

interface ConsignmentFiltersProps {
    sources: string[];
    destinations: string[];
    couriers: string[];
    onApply: (f: ConsignmentFilterValues) => void;
    onExportPdf: () => void;
    onExportExcel: () => void;
    onExportCsv: () => void;
    onRefresh: () => void;
}

const DATE_PRESETS = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Quarter', value: 'quarter' },
    { label: 'This Year', value: 'year' },
    { label: 'Custom', value: 'custom' },
];

const getDateRange = (preset: string): { from: string; to: string } => {
    const now = dayjs();
    switch (preset) {
        case 'today': return { from: now.startOf('day').toISOString(), to: now.endOf('day').toISOString() };
        case 'week': return { from: now.startOf('week').toISOString(), to: now.endOf('week').toISOString() };
        case 'month': return { from: now.startOf('month').toISOString(), to: now.endOf('month').toISOString() };
        case 'quarter': {
            const month = now.month();
            const quarterStart = now.month(Math.floor(month / 3) * 3).startOf('month');
            const quarterEnd = quarterStart.add(2, 'month').endOf('month');
            return { from: quarterStart.toISOString(), to: quarterEnd.toISOString() };
        }
        case 'year': return { from: now.startOf('year').toISOString(), to: now.endOf('year').toISOString() };
        default: return { from: '', to: '' };
    }
};

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

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {children}
    </Typography>
);

const allItem = (label: string) => (
    <MenuItem value="">
        <em style={{ fontSize: '0.8rem', fontStyle: 'normal', color: '#94A3B8' }}>{label}</em>
    </MenuItem>
);

/**
 * Filter panel + export bar for the Consignments page — the same control as the movements
 * page's `MovementFilters`, with journey-specific fields in place of the movement ones.
 */
const ConsignmentFilters = ({
    sources,
    destinations,
    couriers,
    onApply,
    onExportPdf,
    onExportExcel,
    onExportCsv,
    onRefresh,
}: ConsignmentFiltersProps) => {
    const [showFilters, setShowFilters] = useState(true);
    const [datePreset, setDatePreset] = useState('all');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [status, setStatus] = useState('');
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [courier, setCourier] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [plateNumber, setPlateNumber] = useState('');
    const [timeliness, setTimeliness] = useState('');
    const [load, setLoad] = useState('');

    const handleApply = () => {
        const range = datePreset === 'custom'
            ? {
                from: customFrom ? dayjs(customFrom).startOf('day').toISOString() : '',
                to: customTo ? dayjs(customTo).endOf('day').toISOString() : '',
            }
            : getDateRange(datePreset);
        onApply({
            dateFrom: range.from || undefined,
            dateTo: range.to || undefined,
            status: status || undefined,
            source: source || undefined,
            destination: destination || undefined,
            courier: courier || undefined,
            trackingNumber: trackingNumber.trim() || undefined,
            plateNumber: plateNumber.trim() || undefined,
            timeliness: timeliness || undefined,
            load: load || undefined,
        });
    };

    const handleClear = () => {
        setDatePreset('all');
        setCustomFrom('');
        setCustomTo('');
        setStatus('');
        setSource('');
        setDestination('');
        setCourier('');
        setTrackingNumber('');
        setPlateNumber('');
        setTimeliness('');
        setLoad('');
        onApply({});
    };

    return (
        <Box>
            {/* ── Filter panel ─────────────────────────────────────── */}
            <Box sx={{
                bgcolor: '#fff',
                border: '1px solid #EEF2F7',
                borderRadius: 2,
                mb: 2.5,
                overflow: 'hidden',
            }}>
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
                        <IconButton size="small" onClick={() => setShowFilters((p) => !p)} sx={{ color: '#64748B' }}>
                            <FilterAltOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Collapse in={showFilters}>
                    <Box sx={{ px: 2.5, py: 2 }}>
                        <Grid container spacing={1.5} alignItems="flex-end">

                            {/* Date preset */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Period</FieldLabel>
                                <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                    <Select
                                        value={datePreset}
                                        onChange={(e) => setDatePreset(e.target.value)}
                                        startAdornment={(
                                            <InputAdornment position="start">
                                                <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: PRIMARY }} />
                                            </InputAdornment>
                                        )}
                                    >
                                        {DATE_PRESETS.map((d) => (
                                            <MenuItem key={d.value} value={d.value} sx={{ fontSize: '0.8rem' }}>{d.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Custom date range */}
                            {datePreset === 'custom' && (
                                <>
                                    <Grid item xs={6} sm={3} md={1.5}>
                                        <FieldLabel>From</FieldLabel>
                                        <TextField fullWidth size="small" type="date" value={customFrom}
                                            onChange={(e) => setCustomFrom(e.target.value)} sx={PILL_INPUT_SX} />
                                    </Grid>
                                    <Grid item xs={6} sm={3} md={1.5}>
                                        <FieldLabel>To</FieldLabel>
                                        <TextField fullWidth size="small" type="date" value={customTo}
                                            onChange={(e) => setCustomTo(e.target.value)} sx={PILL_INPUT_SX} />
                                    </Grid>
                                </>
                            )}

                            {/* Status */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Status</FieldLabel>
                                <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                    <Select value={status} onChange={(e) => setStatus(e.target.value)} displayEmpty>
                                        {allItem('All Statuses')}
                                        {(Object.keys(consignmentStatusLabels) as ConsignmentStatus[]).map((s) => (
                                            <MenuItem key={s} value={s} sx={{ fontSize: '0.8rem' }}>
                                                {consignmentStatusLabels[s]}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Source */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Source</FieldLabel>
                                <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                    <Select value={source} onChange={(e) => setSource(e.target.value)} displayEmpty>
                                        {allItem('All Sources')}
                                        {sources.map((s) => <MenuItem key={s} value={s} sx={{ fontSize: '0.8rem' }}>{s}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Destination */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Destination</FieldLabel>
                                <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                    <Select value={destination} onChange={(e) => setDestination(e.target.value)} displayEmpty>
                                        {allItem('All Destinations')}
                                        {destinations.map((d) => <MenuItem key={d} value={d} sx={{ fontSize: '0.8rem' }}>{d}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Courier */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Courier</FieldLabel>
                                <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                    <Select value={courier} onChange={(e) => setCourier(e.target.value)} displayEmpty>
                                        {allItem('All Couriers')}
                                        {couriers.map((c) => <MenuItem key={c} value={c} sx={{ fontSize: '0.8rem' }}>{c}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Plate number */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Plate No</FieldLabel>
                                <TextField
                                    fullWidth size="small" placeholder="e.g. UBP 237P"
                                    value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)}
                                    sx={PILL_INPUT_SX}
                                />
                            </Grid>

                            {/* Tracking number */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Tracking #</FieldLabel>
                                <TextField
                                    fullWidth size="small" placeholder="e.g. PLK-474839"
                                    value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
                                    sx={PILL_INPUT_SX}
                                />
                            </Grid>

                            {/* Timeliness */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Timeliness</FieldLabel>
                                <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                    <Select value={timeliness} onChange={(e) => setTimeliness(e.target.value)} displayEmpty>
                                        {allItem('Any')}
                                        <MenuItem value="overdue" sx={{ fontSize: '0.8rem' }}>Overdue</MenuItem>
                                        <MenuItem value="on-time" sx={{ fontSize: '0.8rem' }}>On schedule</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Load */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Load</FieldLabel>
                                <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                    <Select value={load} onChange={(e) => setLoad(e.target.value)} displayEmpty>
                                        {allItem('Any')}
                                        <MenuItem value="loaded" sx={{ fontSize: '0.8rem' }}>Carrying movements</MenuItem>
                                        <MenuItem value="empty" sx={{ fontSize: '0.8rem' }}>Nothing loaded</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Action buttons */}
                            <Grid item xs={12} sm="auto">
                                <Stack direction="row" gap={1} sx={{ mt: { xs: 0.5, md: 0 } }}>
                                    <Button
                                        size="small" variant="contained" onClick={handleApply}
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
                                        size="small" variant="outlined" onClick={handleClear}
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

            {/* ── Export bar ──────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mr: 0.5 }}>Export as:</Typography>

                <Tooltip title="Export PDF">
                    <Button
                        size="small" variant="outlined"
                        startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                        onClick={onExportPdf}
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
                        onClick={onExportExcel}
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
                        onClick={onExportCsv}
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
                    <IconButton
                        size="small" onClick={onRefresh}
                        sx={{
                            width: 32, height: 32, border: '1px solid #E2E8F0', borderRadius: '8px',
                            color: '#64748B',
                            '&:hover': { borderColor: PRIMARY, color: PRIMARY, bgcolor: alpha(PRIMARY, 0.05) },
                        }}
                    >
                        <RefreshOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default ConsignmentFilters;

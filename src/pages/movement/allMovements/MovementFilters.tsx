/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from 'react';
import {
    alpha,
    Box,
    Button,
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
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import dayjs from 'dayjs';
import { brand } from '../../../utils/tokens';
import {
    movementTypeLabels, statusConfig, categoryLabels, receiptStatusLabels,
    MovementType, MovementStatus, MovementCategory, ReceiptStatus,
} from '../constants';
import { IMovement } from '../interface';

const PRIMARY = brand[500];

/** Values collected by the movements filter panel — applied client-side on the loaded list. */
export interface MovementFilterValues {
    dateFrom?: string;
    dateTo?: string;
    movementType?: string;
    movementCategory?: string;
    status?: string;
    source?: string;
    destination?: string;
    courier?: string;
    trackingNumber?: string;
    receiptStatus?: string;
    initiator?: string;
}

// ── Shared filter predicate + option derivation (used by both movement pages) ──

export const movementDestLabel = (m: IMovement) =>
    m.destStore?.name ?? (m.recipientUser ? `${m.recipientUser.firstName} ${m.recipientUser.lastName}` : '—');

export const movementCourierName = (m: IMovement) => m.courier?.name ?? m.courierService ?? '';

export const movementInitiatorName = (m: IMovement) =>
    m.initiator ? `${m.initiator.firstName} ${m.initiator.lastName}` : '';

export const hasActiveMovementFilters = (f: MovementFilterValues) => Object.values(f).some(Boolean);

/** Applies the panel's filter values to a movement — every set field must match (AND). */
export const matchesMovementFilters = (m: IMovement, f: MovementFilterValues): boolean => {
    if (f.dateFrom && (!m.createDate || new Date(m.createDate) < new Date(f.dateFrom))) return false;
    if (f.dateTo && (!m.createDate || new Date(m.createDate) > new Date(f.dateTo))) return false;
    if (f.movementType && m.movementType !== f.movementType) return false;
    if (f.movementCategory && m.movementCategory !== f.movementCategory) return false;
    if (f.status && m.status !== f.status) return false;
    if (f.source && m.sourceStore?.name !== f.source) return false;
    if (f.destination && movementDestLabel(m) !== f.destination) return false;
    if (f.courier && movementCourierName(m) !== f.courier) return false;
    if (f.trackingNumber && !m.trackingNumber?.toLowerCase().includes(f.trackingNumber.toLowerCase())) return false;
    if (f.receiptStatus && m.receiptStatus !== f.receiptStatus) return false;
    if (f.initiator && movementInitiatorName(m) !== f.initiator) return false;
    return true;
};

const unique = (values: Array<string | undefined | null>) =>
    Array.from(new Set(values.filter((v): v is string => !!v && v !== '—'))).sort();

/** Unique dropdown option lists (source/destination/courier/initiator) from the loaded movements. */
export const deriveMovementFilterOptions = (movements: IMovement[]) => ({
    sources: unique(movements.map((m) => m.sourceStore?.name)),
    destinations: unique(movements.map(movementDestLabel)),
    couriers: unique(movements.map(movementCourierName)),
    initiators: unique(movements.map(movementInitiatorName)),
});

interface MovementFiltersProps {
    /** Unique option lists derived from the loaded movements. */
    sources: string[];
    destinations: string[];
    couriers: string[];
    initiators: string[];
    onApply: (f: MovementFilterValues) => void;
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

/** "All …" placeholder item styled the same as the reports page's empty options. */
const allItem = (label: string) => (
    <MenuItem value="">
        <em style={{ fontSize: '0.8rem', fontStyle: 'normal', color: '#94A3B8' }}>{label}</em>
    </MenuItem>
);

/**
 * Filter panel + export bar for the All Movements page — visually identical to the
 * reports page's `ReportShell` (collapsible "Filters & Options" panel, pill inputs,
 * PDF / Excel / CSV export bar), but with movement-specific filter fields.
 */
const MovementFilters = ({
    sources,
    destinations,
    couriers,
    initiators,
    onApply,
    onExportPdf,
    onExportExcel,
    onExportCsv,
    onRefresh,
}: MovementFiltersProps) => {
    const [showFilters, setShowFilters] = useState(true);
    const [datePreset, setDatePreset] = useState('all');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [movementType, setMovementType] = useState('');
    const [movementCategory, setMovementCategory] = useState('');
    const [status, setStatus] = useState('');
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [courier, setCourier] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [receiptStatus, setReceiptStatus] = useState('');
    const [initiator, setInitiator] = useState('');

    const handleApply = () => {
        const range = datePreset === 'custom'
            ? { from: customFrom ? dayjs(customFrom).startOf('day').toISOString() : '', to: customTo ? dayjs(customTo).endOf('day').toISOString() : '' }
            : getDateRange(datePreset);
        onApply({
            dateFrom: range.from || undefined,
            dateTo: range.to || undefined,
            movementType: movementType || undefined,
            movementCategory: movementCategory || undefined,
            status: status || undefined,
            source: source || undefined,
            destination: destination || undefined,
            courier: courier || undefined,
            trackingNumber: trackingNumber.trim() || undefined,
            receiptStatus: receiptStatus || undefined,
            initiator: initiator || undefined,
        });
    };

    const handleClear = () => {
        setDatePreset('all');
        setCustomFrom('');
        setCustomTo('');
        setMovementType('');
        setMovementCategory('');
        setStatus('');
        setSource('');
        setDestination('');
        setCourier('');
        setTrackingNumber('');
        setReceiptStatus('');
        setInitiator('');
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
                {/* filter header */}
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
                        <IconButton size="small" onClick={() => setShowFilters(p => !p)} sx={{ color: '#64748B' }}>
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
                                    <Select value={datePreset} onChange={e => setDatePreset(e.target.value)}
                                        startAdornment={<InputAdornment position="start"><CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: PRIMARY }} /></InputAdornment>}>
                                        {DATE_PRESETS.map(d => <MenuItem key={d.value} value={d.value} sx={{ fontSize: '0.8rem' }}>{d.label}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Custom date range */}
                            {datePreset === 'custom' && (
                                <>
                                    <Grid item xs={6} sm={3} md={1.5}>
                                        <FieldLabel>From</FieldLabel>
                                        <TextField fullWidth size="small" type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} sx={PILL_INPUT_SX} />
                                    </Grid>
                                    <Grid item xs={6} sm={3} md={1.5}>
                                        <FieldLabel>To</FieldLabel>
                                        <TextField fullWidth size="small" type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} sx={PILL_INPUT_SX} />
                                    </Grid>
                                </>
                            )}

                            {/* Movement type */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Type</FieldLabel>
                                <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                    <Select value={movementType} onChange={e => setMovementType(e.target.value)} displayEmpty>
                                        {allItem('All Types')}
                                        {(Object.keys(movementTypeLabels) as MovementType[]).map(t => (
                                            <MenuItem key={t} value={t} sx={{ fontSize: '0.8rem' }}>{movementTypeLabels[t]}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Category */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Category</FieldLabel>
                                <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                    <Select value={movementCategory} onChange={e => setMovementCategory(e.target.value)} displayEmpty>
                                        {allItem('All Categories')}
                                        {(Object.keys(categoryLabels) as MovementCategory[]).map(c => (
                                            <MenuItem key={c} value={c} sx={{ fontSize: '0.8rem' }}>{categoryLabels[c]}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Status */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Status</FieldLabel>
                                <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                    <Select value={status} onChange={e => setStatus(e.target.value)} displayEmpty>
                                        {allItem('All Statuses')}
                                        {(Object.keys(statusConfig) as MovementStatus[]).map(s => (
                                            <MenuItem key={s} value={s} sx={{ fontSize: '0.8rem' }}>{statusConfig[s].label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Source store */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Source</FieldLabel>
                                <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                    <Select value={source} onChange={e => setSource(e.target.value)} displayEmpty>
                                        {allItem('All Sources')}
                                        {sources.map(s => <MenuItem key={s} value={s} sx={{ fontSize: '0.8rem' }}>{s}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Destination */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Destination</FieldLabel>
                                <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                    <Select value={destination} onChange={e => setDestination(e.target.value)} displayEmpty>
                                        {allItem('All Destinations')}
                                        {destinations.map(d => <MenuItem key={d} value={d} sx={{ fontSize: '0.8rem' }}>{d}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Courier */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Courier</FieldLabel>
                                <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                    <Select value={courier} onChange={e => setCourier(e.target.value)} displayEmpty>
                                        {allItem('All Couriers')}
                                        {couriers.map(c => <MenuItem key={c} value={c} sx={{ fontSize: '0.8rem' }}>{c}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Tracking number */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Tracking #</FieldLabel>
                                <TextField
                                    fullWidth size="small" placeholder="e.g. TRK-0012"
                                    value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                                    sx={PILL_INPUT_SX}
                                />
                            </Grid>

                            {/* Receipt status */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Receipt</FieldLabel>
                                <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                    <Select value={receiptStatus} onChange={e => setReceiptStatus(e.target.value)} displayEmpty>
                                        {allItem('All Receipts')}
                                        {(Object.keys(receiptStatusLabels) as ReceiptStatus[]).map(r => (
                                            <MenuItem key={r} value={r} sx={{ fontSize: '0.8rem' }}>{receiptStatusLabels[r]}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Initiator */}
                            <Grid item xs={12} sm={6} md={2}>
                                <FieldLabel>Initiated By</FieldLabel>
                                <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                    <Select value={initiator} onChange={e => setInitiator(e.target.value)} displayEmpty>
                                        {allItem('All Initiators')}
                                        {initiators.map(i => <MenuItem key={i} value={i} sx={{ fontSize: '0.8rem' }}>{i}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Action buttons */}
                            <Grid item xs={12} sm="auto">
                                <Stack direction="row" gap={1} sx={{ mt: { xs: 0.5, md: 0 } }}>
                                    <Button
                                        size="small" variant="contained"
                                        onClick={handleApply}
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
                                        onClick={handleClear}
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
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                gap: 1, mb: 2,
            }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mr: 0.5 }}>Export as:</Typography>

                <Tooltip title="Export PDF">
                    <Button
                        size="small" variant="outlined" startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: '14px !important' }} />}
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
                        size="small" variant="outlined" startIcon={<TableChartOutlinedIcon sx={{ fontSize: '14px !important' }} />}
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
                        size="small" variant="outlined" startIcon={<DataObjectOutlinedIcon sx={{ fontSize: '14px !important' }} />}
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
                    <IconButton size="small" onClick={onRefresh}
                        sx={{
                            width: 32, height: 32, border: '1px solid #E2E8F0', borderRadius: '8px',
                            color: '#64748B',
                            '&:hover': { borderColor: PRIMARY, color: PRIMARY, bgcolor: alpha(PRIMARY, 0.05) },
                        }}>
                        <RefreshOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
};

export default MovementFilters;

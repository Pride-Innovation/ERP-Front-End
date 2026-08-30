import {
    alpha,
    Badge,
    Box,
    Button,
    Chip,
    Collapse,
    Divider,
    FormControl,
    IconButton,
    InputAdornment,
    MenuItem,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { CustomToolbarWrapperProps, ITableToolBar } from './interface';
import FileUploadButton from '../forms/FileUploadButton';
import CustomGridToolbarExport from './CustomGridToolbarExport';
import { useContext, useEffect, useState } from 'react';
import { FileContext } from '../../context/file/FileContext';
import dayjs, { Dayjs } from 'dayjs';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import usePermissions from '../../core/permissions/usePermissions';

const PRIMARY   = '#08796C';
const P8        = alpha(PRIMARY, 0.08);
const P16       = alpha(PRIMARY, 0.16);
const BORDER    = '#E8EDF3';
const MUTED     = '#94A3B8';
const BTN_H     = 34;

// ─── Shared button sx factories ───────────────────────────────────────────────
const iconBtnSx = (active = false) => ({
    width: BTN_H, height: BTN_H, borderRadius: '8px',
    border: `1px solid ${active ? PRIMARY : BORDER}`,
    color: active ? PRIMARY : '#64748B',
    bgcolor: active ? P8 : 'transparent',
    transition: 'all 0.15s',
    '&:hover': { borderColor: PRIMARY, color: PRIMARY, bgcolor: P8 },
});

const TableToolBar = ({
    header,
    onCreationHandler,
    module,
    importData,
    assetTypeId,
    exportData,
    createAction,
    rows = [],
    refresh,
    columnFilters = [],
    onApplyFilters,
    tableIcon,
    createPermission,
    exportPermission,
    importPermission,
    onExport,
}: ITableToolBar) => {
    const { setFileName } = useContext(FileContext);
    useEffect(() => { setFileName(module) }, [module]);
    const { has } = usePermissions();
    const canCreate = !createPermission || has(createPermission);
    // Same shape as canCreate: no permission named means the caller has not opted this table in,
    // so the button behaves exactly as it did before.
    const canExport = !exportPermission || has(exportPermission);
    const canImport = !importPermission || has(importPermission);

    // ── Column filter panel ───────────────────────────────────────────────────
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [filterValues, setFilterValues] = useState<Record<string, any>>({});
    const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
    const [drStates, setDrStates] = useState<Record<string, { preset: string; from: Dayjs | null; to: Dayjs | null }>>({});

    const activeFilterCount = Object.values(appliedFilters).filter(v => {
        if (!v) return false;
        if (typeof v === 'object' && !Array.isArray(v)) return v.from || v.to;
        return true;
    }).length;

    const buildApiFilters = (
        values: Record<string, any>,
        dateRanges: Record<string, { preset: string; from: Dayjs | null; to: Dayjs | null }>
    ): Record<string, any> => {
        const api: Record<string, any> = {};
        Object.entries(values).forEach(([k, v]) => {
            const colDef = columnFilters.find(c => c.key === k);
            if (colDef?.type === 'dateRange') return;
            if (v !== undefined && v !== null && v !== '') api[k] = v;
        });
        Object.entries(dateRanges).forEach(([k, dr]) => {
            if (dr.preset) {
                if (dr.from) api[`${k}From`] = dr.from.startOf('day').toISOString();
                if (dr.to)   api[`${k}To`]   = dr.to.endOf('day').toISOString();
            }
        });
        return api;
    };

    const handleApplyFilters = () => {
        const display: Record<string, any> = {};
        Object.entries(filterValues).forEach(([k, v]) => {
            const colDef = columnFilters.find(c => c.key === k);
            if (colDef?.type === 'dateRange') return;
            if (v !== undefined && v !== null && v !== '') display[k] = v;
        });
        Object.entries(drStates).forEach(([k, dr]) => {
            if (dr.preset) display[k] = { preset: dr.preset, from: dr.from?.toISOString(), to: dr.to?.toISOString() };
        });
        setAppliedFilters(display);
        onApplyFilters?.(buildApiFilters(filterValues, drStates));
    };

    const handleClearAll = () => {
        setFilterValues({});
        setAppliedFilters({});
        setDrStates({});
        onApplyFilters?.({});
    };

    const handleRemoveFilter = (key: string) => {
        const nextApplied = { ...appliedFilters };  delete nextApplied[key];
        const nextVals    = { ...filterValues };    delete nextVals[key];
        const nextDr      = { ...drStates };        delete nextDr[key];
        setAppliedFilters(nextApplied);
        setFilterValues(nextVals);
        setDrStates(nextDr);
        onApplyFilters?.(buildApiFilters(nextVals, nextDr));
    };

    // ── Date range helpers ────────────────────────────────────────────────────
    const DATE_PRESETS = [
        { value: 'today',   label: 'Today' },
        { value: 'week',    label: 'This Week' },
        { value: 'month',   label: 'This Month' },
        { value: 'quarter', label: 'This Quarter' },
        { value: 'year',    label: 'This Year' },
        { value: 'custom',  label: 'Custom range…' },
    ];

    const getPresetDates = (preset: string): { from: Dayjs; to: Dayjs } | null => {
        const now = dayjs();
        switch (preset) {
            case 'today':   return { from: now.startOf('day'), to: now.endOf('day') };
            case 'week':    return { from: now.startOf('week'), to: now.endOf('week') };
            case 'month':   return { from: now.startOf('month'), to: now.endOf('month') };
            case 'quarter': {
                const q = Math.floor(now.month() / 3);
                return { from: now.month(q * 3).startOf('month'), to: now.month(q * 3 + 2).endOf('month') };
            }
            case 'year': return { from: now.startOf('year'), to: now.endOf('year') };
            default: return null;
        }
    };

    const handlePresetChange = (key: string, preset: string) => {
        const range = preset !== 'custom' ? getPresetDates(preset) : null;
        setDrStates(prev => ({ ...prev, [key]: { preset, from: range?.from ?? null, to: range?.to ?? null } }));
        setFilterValues(prev => ({ ...prev, [key]: { preset } }));
    };

    // ─── Shared input sx ──────────────────────────────────────────────────────
    const inputSx = (hasVal: boolean) => ({
        '& .MuiOutlinedInput-root': {
            height: 34,
            borderRadius: '8px',
            fontSize: '0.8rem',
            bgcolor: hasVal ? alpha(PRIMARY, 0.04) : '#fff',
            transition: 'background-color 0.15s',
            '& fieldset': { borderColor: hasVal ? P16 : BORDER, transition: 'border-color 0.15s' },
            '&:hover fieldset': { borderColor: alpha(PRIMARY, 0.4) },
            '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 },
        },
        '& input': { color: hasVal ? PRIMARY : '#0F172A', fontWeight: hasVal ? 600 : 400, fontSize: '0.8rem' },
        '& input::placeholder': { color: MUTED, opacity: 1 },
    });

    const showImport = importData && canImport;
    const showExport = exportData && canExport;
    const showCreate = createAction && canCreate;
    const hasActions = showImport || showExport || showCreate || refresh || columnFilters.length > 0;

    return (
        <Box sx={{ width: '100%', bgcolor: '#fff' }}>

            {/* ═══════════════════════════════════════════════════════════════
                TOP BAR
            ═══════════════════════════════════════════════════════════════ */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2.5,
                py: 1.75,
                borderBottom: `1px solid ${BORDER}`,
                flexWrap: 'wrap',
                gap: 1.5,
                minHeight: 64,
            }}>

                {/* ── Left: icon + title ─────────────────────────────────────── */}
                <Stack direction="row" alignItems="center" gap={1.5} sx={{ minWidth: 0 }}>
                    <Box sx={{
                        width: 36, height: 36,
                        borderRadius: '9px',
                        bgcolor: P8,
                        border: `1px solid ${P16}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: PRIMARY,
                    }}>
                        {tableIcon ?? <FilterListOutlinedIcon sx={{ fontSize: 17 }} />}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{
                            fontWeight: 700,
                            fontSize: '0.92rem',
                            color: '#0F172A',
                            lineHeight: 1.25,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {header?.plural}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: MUTED, lineHeight: 1.3 }}>
                            Browse and manage records
                        </Typography>
                    </Box>
                </Stack>

                {/* ── Right: action buttons ─────────────────────────────────── */}
                {hasActions && (
                    <Stack direction="row" alignItems="center" gap={0.75} flexShrink={0}>

                        {/* Column filter toggle */}
                        {columnFilters.length > 0 && (
                            <Tooltip title={showFilterPanel ? 'Hide Filters' : 'Show Filters'} arrow>
                                <IconButton
                                    onClick={() => setShowFilterPanel(p => !p)}
                                    sx={iconBtnSx(showFilterPanel)}
                                >
                                    <Badge
                                        badgeContent={activeFilterCount}
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                bgcolor: PRIMARY, color: '#fff',
                                                fontSize: '0.6rem', height: 14, minWidth: 14,
                                                p: 0, top: 1, right: 1,
                                            },
                                        }}
                                    >
                                        <TuneOutlinedIcon sx={{ fontSize: 17 }} />
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                        )}

                        {/* Refresh */}
                        {refresh && (
                            <Tooltip title="Refresh" arrow>
                                <IconButton
                                    onClick={() => window.location.reload()}
                                    sx={iconBtnSx()}
                                >
                                    <RefreshOutlinedIcon sx={{ fontSize: 17 }} />
                                </IconButton>
                            </Tooltip>
                        )}

                        {/* Visual divider before import/export/create */}
                        {(showImport || showExport || showCreate) && (refresh || columnFilters.length > 0) && (
                            <Divider orientation="vertical" flexItem sx={{ mx: 0.25, borderColor: BORDER, height: 20, alignSelf: 'center' }} />
                        )}

                        {showImport && <FileUploadButton title={header.plural} module={module} assetTypeId={assetTypeId} />}
                        {showExport && <CustomGridToolbarExport module={module} rows={rows} onExport={onExport} />}

                        {/* Create button */}
                        {showCreate && (
                            <Button
                                onClick={() => onCreationHandler()}
                                variant="contained"
                                startIcon={<AddOutlinedIcon sx={{ fontSize: '16px !important' }} />}
                                sx={{
                                    height: BTN_H, px: 2, borderRadius: '8px',
                                    bgcolor: PRIMARY, color: '#fff',
                                    textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
                                    boxShadow: `0 1px 4px ${alpha(PRIMARY, 0.25)}, 0 4px 12px ${alpha(PRIMARY, 0.18)}`,
                                    '&:hover': {
                                        bgcolor: '#065E53',
                                        boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.35)}, 0 6px 18px ${alpha(PRIMARY, 0.22)}`,
                                        transform: 'translateY(-1px)',
                                    },
                                    transition: 'all 0.15s',
                                }}
                            >
                                Add {header?.singular ?? 'Record'}
                            </Button>
                        )}
                    </Stack>
                )}
            </Box>

            {/* ═══════════════════════════════════════════════════════════════
                FILTER PANEL (collapsed/expanded)
            ═══════════════════════════════════════════════════════════════ */}
            {columnFilters.length > 0 && (
                <Collapse in={showFilterPanel}>
                    <Box sx={{
                        borderBottom: `1px solid ${BORDER}`,
                        bgcolor: alpha(PRIMARY, 0.015),
                    }}>

                        {/* ── Section header ──────────────────────────────── */}
                        <Box sx={{
                            px: 2.5, pt: 1.5, pb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <Stack direction="row" alignItems="center" gap={1}>
                                <TuneOutlinedIcon sx={{ fontSize: 14, color: PRIMARY }} />
                                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: PRIMARY, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                    Filter Records
                                </Typography>
                                {activeFilterCount > 0 && (
                                    <Box sx={{
                                        px: 0.75, height: 16, borderRadius: '5px',
                                        bgcolor: P8, border: `1px solid ${P16}`,
                                        display: 'flex', alignItems: 'center',
                                    }}>
                                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: PRIMARY }}>
                                            {activeFilterCount} active
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Box>

                        {/* ── Active filter chips ──────────────────────────── */}
                        {activeFilterCount > 0 && (
                            <Box sx={{ px: 2.5, pb: 1 }}>
                                <Stack direction="row" flexWrap="wrap" alignItems="center" gap={0.6}>
                                    {Object.entries(appliedFilters).map(([key, val]) => {
                                        const colDef = columnFilters.find(c => c.key === key);
                                        if (!colDef) return null;
                                        const isRange = typeof val === 'object' && val !== null;
                                        const displayVal = colDef.type === 'select'
                                            ? (colDef.options ?? []).find(o => String(o.value) === String(val))?.label ?? String(val)
                                            : String(val);
                                        const chipLabel = isRange
                                            ? `${colDef.label}: ${val.from ? dayjs(val.from).format('DD MMM') : '…'} → ${val.to ? dayjs(val.to).format('DD MMM YY') : '…'}`
                                            : `${colDef.label}: ${displayVal}`;
                                        return (
                                            <Chip
                                                key={key}
                                                label={chipLabel}
                                                size="small"
                                                onDelete={() => handleRemoveFilter(key)}
                                                deleteIcon={<CloseOutlinedIcon sx={{ fontSize: '11px !important', color: 'rgba(255,255,255,0.75) !important', '&:hover': { color: '#fff !important' } }} />}
                                                sx={{
                                                    height: 22,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    bgcolor: PRIMARY,
                                                    color: '#fff',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    '& .MuiChip-label': { px: 1 },
                                                }}
                                            />
                                        );
                                    })}
                                    <Button
                                        size="small"
                                        variant="text"
                                        onClick={handleClearAll}
                                        sx={{
                                            fontSize: '0.7rem', color: '#DC2626',
                                            textTransform: 'none', fontWeight: 600,
                                            px: 0.75, minWidth: 0, py: 0.25,
                                            borderRadius: '6px',
                                            '&:hover': { bgcolor: alpha('#DC2626', 0.06) },
                                        }}
                                    >
                                        Clear all
                                    </Button>
                                </Stack>
                            </Box>
                        )}

                        {/* ── Filter inputs ────────────────────────────────── */}
                        <Box sx={{ px: 2.5, pb: 2 }}>
                            <Stack direction="row" alignItems="flex-end" flexWrap="wrap" gap={1.25}>

                                {columnFilters.map(col => {

                                    // ── Date range ──────────────────────────
                                    if (col.type === 'dateRange') {
                                        const dr = drStates[col.key] ?? { preset: '', from: null, to: null };
                                        const isActive = !!dr.preset;
                                        return (
                                            <Box key={col.key}>
                                                <Typography sx={{ fontSize: '0.67rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                                                    {col.label}
                                                </Typography>
                                                <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
                                                    {/* Period select */}
                                                    <Box sx={{
                                                        display: 'flex', alignItems: 'center', height: 34,
                                                        border: `1px solid ${isActive ? P16 : BORDER}`,
                                                        borderRadius: '8px', overflow: 'hidden',
                                                        bgcolor: isActive ? alpha(PRIMARY, 0.04) : '#fff',
                                                        transition: 'all 0.15s',
                                                        '&:focus-within': { borderColor: PRIMARY, borderWidth: '1.5px' },
                                                    }}>
                                                        <Stack direction="row" alignItems="center" gap={0.4} sx={{ pl: 1.25, pr: 0.75, color: isActive ? PRIMARY : MUTED, flexShrink: 0 }}>
                                                            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
                                                        </Stack>
                                                        <Box sx={{ width: 1, height: 18, bgcolor: isActive ? P16 : BORDER }} />
                                                        <Select
                                                            value={dr.preset}
                                                            displayEmpty
                                                            variant="standard"
                                                            disableUnderline
                                                            onChange={e => handlePresetChange(col.key, e.target.value)}
                                                            sx={{
                                                                minWidth: 140, px: 1,
                                                                '& .MuiSelect-select': {
                                                                    py: 0, pr: '22px !important',
                                                                    display: 'flex', alignItems: 'center', height: 32,
                                                                },
                                                                '& .MuiSelect-icon': { color: isActive ? PRIMARY : MUTED, right: 4, fontSize: 18 },
                                                            }}
                                                            renderValue={v => v
                                                                ? <Typography sx={{ fontSize: '0.79rem', fontWeight: 600, color: PRIMARY }}>{DATE_PRESETS.find(p => p.value === v)?.label}</Typography>
                                                                : <Typography sx={{ fontSize: '0.79rem', color: MUTED }}>Select period…</Typography>
                                                            }
                                                        >
                                                            {DATE_PRESETS.map(p => (
                                                                <MenuItem key={p.value} value={p.value} sx={{ fontSize: '0.82rem', py: 0.75 }}>
                                                                    {p.label}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </Box>

                                                    {/* Computed range badge */}
                                                    {dr.preset && dr.preset !== 'custom' && dr.from && dr.to && (
                                                        <Box sx={{
                                                            display: 'flex', alignItems: 'center', gap: 0.5,
                                                            bgcolor: P8, px: 1.1, height: 26,
                                                            borderRadius: '6px', border: `1px solid ${P16}`,
                                                        }}>
                                                            <Typography sx={{ fontSize: '0.7rem', color: PRIMARY, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                                {dr.from.format('DD MMM')} → {dr.to.format('DD MMM YY')}
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    {/* Custom date pickers */}
                                                    {dr.preset === 'custom' && (
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <Box sx={{
                                                                display: 'flex', alignItems: 'center', height: 34,
                                                                border: `1px solid ${(dr.from || dr.to) ? P16 : BORDER}`,
                                                                borderRadius: '8px', overflow: 'hidden', bgcolor: '#fff',
                                                                '&:focus-within': { borderColor: PRIMARY },
                                                                transition: 'border-color 0.15s',
                                                            }}>
                                                                <DatePicker
                                                                    value={dr.from}
                                                                    onChange={d => setDrStates(prev => ({ ...prev, [col.key]: { ...prev[col.key], from: d } }))}
                                                                    slotProps={{
                                                                        textField: {
                                                                            size: 'small', variant: 'standard', placeholder: 'From',
                                                                            InputProps: { disableUnderline: true },
                                                                            sx: { width: 110, px: 1.25, '& .MuiInputBase-input': { fontSize: '0.76rem' } },
                                                                        },
                                                                        openPickerButton: { size: 'small', sx: { color: PRIMARY, p: '2px' } },
                                                                    }}
                                                                />
                                                                <Box sx={{ width: 1, height: 18, bgcolor: BORDER, flexShrink: 0 }} />
                                                                <DatePicker
                                                                    value={dr.to}
                                                                    minDate={dr.from ?? undefined}
                                                                    onChange={d => setDrStates(prev => ({ ...prev, [col.key]: { ...prev[col.key], to: d } }))}
                                                                    slotProps={{
                                                                        textField: {
                                                                            size: 'small', variant: 'standard', placeholder: 'To',
                                                                            InputProps: { disableUnderline: true },
                                                                            sx: { width: 110, px: 1.25, '& .MuiInputBase-input': { fontSize: '0.76rem' } },
                                                                        },
                                                                        openPickerButton: { size: 'small', sx: { color: PRIMARY, p: '2px' } },
                                                                    }}
                                                                />
                                                            </Box>
                                                        </LocalizationProvider>
                                                    )}
                                                </Stack>
                                            </Box>
                                        );
                                    }

                                    // ── Select ──────────────────────────────
                                    if (col.type === 'select') {
                                        const val = filterValues[col.key] ?? '';
                                        const hasVal = !!val;
                                        const selectedLabel = (col.options ?? []).find(o => String(o.value) === String(val))?.label ?? '';
                                        return (
                                            <Box key={col.key}>
                                                <Typography sx={{ fontSize: '0.67rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                                                    {col.label}
                                                </Typography>
                                                <FormControl size="small" sx={{ minWidth: 160 }}>
                                                    <Select
                                                        value={val}
                                                        displayEmpty
                                                        onChange={e => setFilterValues(prev => ({ ...prev, [col.key]: e.target.value }))}
                                                        sx={{
                                                            height: 34, borderRadius: '8px', fontSize: '0.8rem',
                                                            bgcolor: hasVal ? alpha(PRIMARY, 0.04) : '#fff',
                                                            color: hasVal ? PRIMARY : MUTED,
                                                            fontWeight: hasVal ? 600 : 400,
                                                            transition: 'all 0.15s',
                                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: hasVal ? P16 : BORDER },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(PRIMARY, 0.4) },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PRIMARY, borderWidth: 1.5 },
                                                            '& .MuiSelect-icon': { color: hasVal ? PRIMARY : MUTED },
                                                        }}
                                                        renderValue={v => v
                                                            ? <Typography component="span" sx={{ fontSize: '0.8rem', color: PRIMARY, fontWeight: 600 }}>{selectedLabel || String(v)}</Typography>
                                                            : <Typography component="span" sx={{ fontSize: '0.8rem', color: MUTED }}>Any…</Typography>
                                                        }
                                                    >
                                                        <MenuItem value="" sx={{ fontSize: '0.8rem', color: MUTED, fontStyle: 'italic', py: 0.75 }}>
                                                            Any {col.label}
                                                        </MenuItem>
                                                        {(col.options ?? []).map(opt => (
                                                            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.8rem', py: 0.75 }}>
                                                                {opt.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        );
                                    }

                                    // ── Text (default) ───────────────────────
                                    const hasVal = !!(filterValues[col.key]);
                                    return (
                                        <Box key={col.key}>
                                            <Typography sx={{ fontSize: '0.67rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                                                {col.label}
                                            </Typography>
                                            <TextField
                                                size="small"
                                                placeholder={col.placeholder ?? `Search ${col.label}…`}
                                                value={filterValues[col.key] ?? ''}
                                                onChange={e => setFilterValues(prev => ({ ...prev, [col.key]: e.target.value }))}
                                                sx={{ minWidth: 160, ...inputSx(hasVal) }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <SearchOutlinedIcon sx={{ fontSize: 13, color: hasVal ? PRIMARY : MUTED }} />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Box>
                                    );
                                })}

                                {/* Spacer */}
                                <Box sx={{ flex: 1, minWidth: 16 }} />

                                {/* Apply / Reset */}
                                <Stack direction="row" gap={0.75} alignItems="flex-end" flexShrink={0} sx={{ pb: 0 }}>
                                    {activeFilterCount > 0 && (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={handleClearAll}
                                            sx={{
                                                height: 34, px: 1.75, borderRadius: '8px',
                                                textTransform: 'none', fontWeight: 600, fontSize: '0.79rem',
                                                color: '#64748B', borderColor: BORDER,
                                                '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC', color: '#475569' },
                                            }}
                                        >
                                            Reset
                                        </Button>
                                    )}
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={handleApplyFilters}
                                        startIcon={<CheckOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                                        sx={{
                                            height: 34, px: 2, borderRadius: '8px',
                                            textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
                                            bgcolor: PRIMARY, color: '#fff',
                                            boxShadow: `0 1px 4px ${alpha(PRIMARY, 0.25)}`,
                                            '&:hover': {
                                                bgcolor: '#065E53',
                                                boxShadow: `0 2px 10px ${alpha(PRIMARY, 0.35)}`,
                                                transform: 'translateY(-1px)',
                                            },
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        Apply Filters
                                    </Button>
                                </Stack>
                            </Stack>
                        </Box>
                    </Box>
                </Collapse>
            )}
        </Box>
    );
};

const CustomToolbarWrapper: React.FC<CustomToolbarWrapperProps> = (props) => <TableToolBar {...props} />;

export default CustomToolbarWrapper;

import {
    alpha,
    Badge,
    Box,
    Button,
    Chip,
    Collapse,
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
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const PRIMARY_COLOR = '#08796C';

const StyledToolbarContainer = Box;

const TableToolBar = ({
    header,
    onCreationHandler,
    module,
    importData,
    exportData,
    createAction,
    // searchAction,
    // onSearch,
    rows = [],
    refresh,
    // status = false,
    // onStatusChange,
    // selectedStatus = 'all',
    // dateRangePicker = false,
    columnFilters = [],
    onApplyFilters,
    tableIcon,
}: ITableToolBar) => {
    const { setFileName } = useContext(FileContext);
    useEffect(() => { setFileName(module) }, [module]);

    // ── Column filter panel state ─────────────────────────────────────────────
    const [showFilterPanel, setShowFilterPanel] = useState(true);
    const [filterValues, setFilterValues] = useState<Record<string, any>>({});
    const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});

    const activeFilterCount = Object.values(appliedFilters).filter(v => {
        if (!v) return false;
        if (typeof v === 'object' && !Array.isArray(v)) return v.from || v.to;
        return true;
    }).length;

    const handleApplyFilters = () => {
        const clean: Record<string, any> = {};
        Object.entries(filterValues).forEach(([k, v]) => {
            const colDef = columnFilters.find(c => c.key === k);
            if (colDef?.type === 'dateRange') return;
            if (v) clean[k] = v;
        });
        Object.entries(drStates).forEach(([k, dr]) => {
            if (dr.preset) {
                clean[k] = {
                    preset: dr.preset,
                    from: dr.from ? dr.from.toISOString() : undefined,
                    to: dr.to ? dr.to.toISOString() : undefined,
                };
            }
        });
        setAppliedFilters(clean);
        onApplyFilters?.(clean);
    };

    const handleClearAll = () => {
        setFilterValues({});
        setAppliedFilters({});
        setDrStates({});
        onApplyFilters?.({});
    };

    const handleRemoveFilter = (key: string) => {
        const next = { ...appliedFilters };
        delete next[key];
        const nextVals = { ...filterValues };
        delete nextVals[key];
        setFilterValues(nextVals);
        setAppliedFilters(next);
        setDrStates(prev => { const n = { ...prev }; delete n[key]; return n; });
        onApplyFilters?.(next);
    };

    // ── Date range column filter state ─────────────────────────────────────
    const [drStates, setDrStates] = useState<Record<string, { preset: string; from: Dayjs | null; to: Dayjs | null }>>({});

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
            case 'year':    return { from: now.startOf('year'), to: now.endOf('year') };
            default: return null;
        }
    };

    const handlePresetChange = (key: string, preset: string) => {
        const range = preset !== 'custom' ? getPresetDates(preset) : null;
        setDrStates(prev => ({ ...prev, [key]: { preset, from: range?.from ?? null, to: range?.to ?? null } }));
        setFilterValues(prev => ({ ...prev, [key]: { preset } }));
    };

    return (
        <StyledToolbarContainer sx={{ width: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>

            {/* ── Top bar: title + action buttons ─────────────────────── */}
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 3, pt: 2.5, pb: 2.5,
                flexWrap: 'wrap', gap: 1.5,
                borderBottom: '1px solid #EEF2F7',
            }}>
                {/* Left: table title */}
                <Stack direction="row" alignItems="center" gap={1.5}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: 1.5,
                        bgcolor: alpha(PRIMARY_COLOR, 0.08),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        {tableIcon ?? <FilterAltOutlinedIcon sx={{ fontSize: 18, color: PRIMARY_COLOR }} />}
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', lineHeight: 1.2 }}>
                            {header?.plural}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                            Browse and manage records
                        </Typography>
                    </Box>
                </Stack>

                {/* Right: action buttons */}
                <Stack direction="row" gap={1} alignItems="center">
                    {/* Column filter toggle */}
                    {columnFilters.length > 0 && (
                        <Tooltip title="Column Filters" arrow>
                            <IconButton
                                onClick={() => setShowFilterPanel(p => !p)}
                                sx={{
                                    width: 38, height: 38, borderRadius: 1.5,
                                    border: `1px solid ${showFilterPanel ? PRIMARY_COLOR : '#E2E8F0'}`,
                                    color: showFilterPanel ? PRIMARY_COLOR : '#64748B',
                                    bgcolor: showFilterPanel ? alpha(PRIMARY_COLOR, 0.06) : 'transparent',
                                    '&:hover': { borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR, bgcolor: alpha(PRIMARY_COLOR, 0.04) },
                                    transition: 'all 0.2s',
                                }}
                            >
                                <Badge
                                    badgeContent={activeFilterCount}
                                    color="primary"
                                    sx={{ '& .MuiBadge-badge': { bgcolor: PRIMARY_COLOR, fontSize: '0.6rem', height: 15, minWidth: 15, p: 0 } }}
                                >
                                    <TuneOutlinedIcon sx={{ fontSize: 18 }} />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                    )}

                    {refresh && (
                        <Tooltip title="Refresh" arrow>
                            <IconButton
                                onClick={() => window.location.reload()}
                                sx={{
                                    width: 38, height: 38, borderRadius: 1.5,
                                    border: `1px solid #E2E8F0`, color: '#64748B',
                                    '&:hover': { borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR, bgcolor: alpha(PRIMARY_COLOR, 0.04) },
                                    transition: 'all 0.2s',
                                }}
                            >
                                <RefreshOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}

                    {importData && <FileUploadButton title={header.plural} module={module} />}
                    {exportData && <CustomGridToolbarExport module={module} rows={rows} />}

                    {createAction && (
                        <Button
                            onClick={() => onCreationHandler()}
                            variant="contained"
                            startIcon={<AddOutlinedIcon sx={{ fontSize: '17px !important' }} />}
                            sx={{
                                height: 38, px: 2.5, borderRadius: "8px",
                                bgcolor: PRIMARY_COLOR, color: '#fff',
                                textTransform: 'none', fontWeight: 600, fontSize: '0.85rem',
                                boxShadow: `0 2px 8px ${alpha(PRIMARY_COLOR, 0.30)}`,
                                '&:hover': {
                                    bgcolor: '#065f54',
                                    boxShadow: `0 4px 14px ${alpha(PRIMARY_COLOR, 0.40)}`,
                                    transform: 'translateY(-1px)',
                                },
                                transition: 'all 0.2s',
                            }}
                        >
                            Add {header?.singular ?? 'Record'}
                        </Button>
                    )}
                </Stack>
            </Box>

            {/* ── Column filter panel ───────────────────────────────────── */}
            {columnFilters.length > 0 && (
                <Collapse in={showFilterPanel}>
                    <Box sx={{
                        px: 2.5, pt: 2, pb: 2,
                        background: `linear-gradient(180deg, ${alpha(PRIMARY_COLOR, 0.03)} 0%, #fff 100%)`,
                        borderBottom: '1px solid #EEF2F7',
                    }}>

                        {/* Active chips row */}
                        {activeFilterCount > 0 && (
                            <Stack direction="row" flexWrap="wrap" alignItems="center" gap={0.75} mb={1.5}>
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', mr: 0.5 }}>
                                    Active:
                                </Typography>
                                {Object.entries(appliedFilters).map(([key, val]) => {
                                    const colDef = columnFilters.find(c => c.key === key);
                                    if (!colDef) return null;
                                    const isRange = typeof val === 'object' && val !== null;
                                    const chipLabel = isRange
                                        ? `${colDef.label}: ${val.from || '…'} → ${val.to || '…'}`
                                        : `${colDef.label}: ${val}`;
                                    return (
                                        <Chip
                                            key={key}
                                            label={chipLabel}
                                            size="small"
                                            onDelete={() => handleRemoveFilter(key)}
                                            deleteIcon={<CloseOutlinedIcon sx={{ fontSize: '12px !important' }} />}
                                            sx={{
                                                height: 22,
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                bgcolor: PRIMARY_COLOR,
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '6px',
                                                '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } },
                                                '& .MuiChip-label': { px: 1 },
                                            }}
                                        />
                                    );
                                })}
                                <Button
                                    size="small"
                                    variant="text"
                                    onClick={handleClearAll}
                                    sx={{ fontSize: '0.7rem', color: '#DC2626', textTransform: 'none', fontWeight: 600, px: 0.75, minWidth: 0, ml: 0.5, '&:hover': { bgcolor: alpha('#DC2626', 0.06) }, borderRadius: '6px' }}
                                >
                                    Clear all
                                </Button>
                            </Stack>
                        )}

                        {/* Filter inputs + Apply row */}
                        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1.5}>

                            {columnFilters.map(col => {

                                const inputSx = {
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        fontSize: '0.8rem',
                                        bgcolor: '#fff',
                                        height: 36,
                                        '& fieldset': { borderColor: '#E2E8F0' },
                                        '&:hover fieldset': { borderColor: alpha(PRIMARY_COLOR, 0.5) },
                                        '&.Mui-focused fieldset': { borderColor: PRIMARY_COLOR, borderWidth: 1.5 },
                                    },
                                };

                                if (col.type === 'dateRange') {
                                    const dr = drStates[col.key] ?? { preset: '', from: null, to: null };
                                    const isActive = !!dr.preset;
                                    const DATE_PRESETS = [
                                        { value: 'today',   label: 'Today' },
                                        { value: 'week',    label: 'This Week' },
                                        { value: 'month',   label: 'This Month' },
                                        { value: 'quarter', label: 'This Quarter' },
                                        { value: 'year',    label: 'This Year' },
                                        { value: 'custom',  label: 'Custom…' },
                                    ];
                                    return (
                                        <Stack key={col.key} direction="row" alignItems="center" gap={1} flexWrap="wrap">
                                            {/* Period select pill */}
                                            <Box sx={{
                                                display: 'flex', alignItems: 'center', height: 36,
                                                border: `1.5px solid ${isActive ? PRIMARY_COLOR : '#E2E8F0'}`,
                                                borderRadius: '8px', overflow: 'hidden',
                                                bgcolor: isActive ? alpha(PRIMARY_COLOR, 0.04) : '#fff',
                                                transition: 'all 0.15s',
                                            }}>
                                                <Stack direction="row" alignItems="center" gap={0.5} sx={{ px: 1.25, color: isActive ? PRIMARY_COLOR : '#94A3B8', flexShrink: 0 }}>
                                                    <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                                                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap', color: 'inherit' }}>{col.label}</Typography>
                                                </Stack>
                                                <Box sx={{ width: '1px', height: 20, bgcolor: isActive ? alpha(PRIMARY_COLOR, 0.3) : '#E2E8F0' }} />
                                                <Select
                                                    value={dr.preset}
                                                    displayEmpty
                                                    variant="standard"
                                                    disableUnderline
                                                    onChange={e => handlePresetChange(col.key, e.target.value)}
                                                    sx={{
                                                        minWidth: 130, px: 1,
                                                        color: dr.preset ? PRIMARY_COLOR : '#94A3B8',
                                                        fontWeight: dr.preset ? 600 : 400,
                                                        '& .MuiSelect-select': { py: 0, pr: '20px !important', display: 'flex', alignItems: 'center', height: 34 },
                                                        '& .MuiSelect-icon': { color: isActive ? PRIMARY_COLOR : '#94A3B8', right: 2 },
                                                    }}
                                                    renderValue={v => v
                                                        ? <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: PRIMARY_COLOR }}>{DATE_PRESETS.find(p => p.value === v)?.label}</Typography>
                                                        : <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8' }}>Period…</Typography>
                                                    }
                                                >
                                                    {DATE_PRESETS.map(p => (
                                                        <MenuItem key={p.value} value={p.value}>
                                                            <Typography sx={{ fontSize: '0.8rem' }}>{p.label}</Typography>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </Box>

                                            {/* Computed range badge for non-custom presets */}
                                            {dr.preset && dr.preset !== 'custom' && dr.from && dr.to && (
                                                <Box sx={{
                                                    display: 'flex', alignItems: 'center', gap: 0.75,
                                                    bgcolor: alpha(PRIMARY_COLOR, 0.07), px: 1.25, height: 28,
                                                    borderRadius: '6px', border: `1px solid ${alpha(PRIMARY_COLOR, 0.15)}`,
                                                }}>
                                                    <Typography sx={{ fontSize: '0.7rem', color: PRIMARY_COLOR, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                        {dr.from.format('DD MMM')} → {dr.to.format('DD MMM YYYY')}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Custom date pickers */}
                                            {dr.preset === 'custom' && (
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <Box sx={{
                                                        display: 'flex', alignItems: 'center', height: 36,
                                                        border: `1.5px solid ${(dr.from || dr.to) ? PRIMARY_COLOR : '#E2E8F0'}`,
                                                        borderRadius: '8px', overflow: 'hidden',
                                                        bgcolor: '#fff', transition: 'border-color 0.2s',
                                                        '&:focus-within': { borderColor: PRIMARY_COLOR },
                                                    }}>
                                                        <DatePicker
                                                            value={dr.from}
                                                            onChange={d => setDrStates(prev => ({ ...prev, [col.key]: { ...prev[col.key], from: d } }))}
                                                            slotProps={{
                                                                textField: {
                                                                    size: 'small', variant: 'standard', placeholder: 'From',
                                                                    InputProps: { disableUnderline: true },
                                                                    sx: { width: 120, px: 1.25, '& .MuiInputBase-input': { fontSize: '0.76rem', color: dr.from ? '#0F172A' : '#94A3B8' } },
                                                                },
                                                                openPickerButton: { size: 'small', sx: { color: PRIMARY_COLOR, p: '2px' } },
                                                            }}
                                                        />
                                                        <Box sx={{ width: '1px', height: 20, bgcolor: '#E2E8F0', flexShrink: 0 }} />
                                                        <DatePicker
                                                            value={dr.to}
                                                            minDate={dr.from ?? undefined}
                                                            onChange={d => setDrStates(prev => ({ ...prev, [col.key]: { ...prev[col.key], to: d } }))}
                                                            slotProps={{
                                                                textField: {
                                                                    size: 'small', variant: 'standard', placeholder: 'To',
                                                                    InputProps: { disableUnderline: true },
                                                                    sx: { width: 120, px: 1.25, '& .MuiInputBase-input': { fontSize: '0.76rem', color: dr.to ? '#0F172A' : '#94A3B8' } },
                                                                },
                                                                openPickerButton: { size: 'small', sx: { color: PRIMARY_COLOR, p: '2px' } },
                                                            }}
                                                        />
                                                    </Box>
                                                </LocalizationProvider>
                                            )}
                                        </Stack>
                                    );
                                }

                                if (col.type === 'select') {
                                    const val = filterValues[col.key] ?? '';
                                    return (
                                        <FormControl key={col.key} size="small" sx={{ minWidth: 160 }}>
                                            <Select
                                                value={val}
                                                displayEmpty
                                                onChange={e => setFilterValues(prev => ({ ...prev, [col.key]: e.target.value }))}
                                                sx={{
                                                    borderRadius: '8px',
                                                    fontSize: '0.8rem',
                                                    height: 36,
                                                    bgcolor: val ? alpha(PRIMARY_COLOR, 0.05) : '#fff',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: val ? PRIMARY_COLOR : '#E2E8F0',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(PRIMARY_COLOR, 0.6) },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PRIMARY_COLOR, borderWidth: 1.5 },
                                                    color: val ? PRIMARY_COLOR : '#94A3B8',
                                                    fontWeight: val ? 600 : 400,
                                                }}
                                                renderValue={v => v
                                                    ? <Typography component="span" sx={{ fontSize: '0.8rem', color: PRIMARY_COLOR, fontWeight: 600 }}>{v as string}</Typography>
                                                    : <Typography component="span" sx={{ fontSize: '0.8rem', color: '#94A3B8' }}>{col.label}</Typography>
                                                }
                                            >
                                                <MenuItem value=""><Typography sx={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>Any {col.label}</Typography></MenuItem>
                                                {(col.options ?? []).map(opt => (
                                                    <MenuItem key={opt.value} value={opt.value}>
                                                        <Typography sx={{ fontSize: '0.8rem' }}>{opt.label}</Typography>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    );
                                }

                                // text (default)
                                const hasVal = !!(filterValues[col.key]);
                                return (
                                    <TextField
                                        key={col.key}
                                        size="small"
                                        placeholder={col.placeholder ?? col.label}
                                        value={filterValues[col.key] ?? ''}
                                        onChange={e => setFilterValues(prev => ({ ...prev, [col.key]: e.target.value }))}
                                        sx={{
                                            minWidth: 160,
                                            ...inputSx,
                                            '& .MuiOutlinedInput-root': {
                                                ...inputSx['& .MuiOutlinedInput-root'],
                                                bgcolor: hasVal ? alpha(PRIMARY_COLOR, 0.04) : '#fff',
                                                '& fieldset': { borderColor: hasVal ? PRIMARY_COLOR : '#E2E8F0' },
                                                '&:hover fieldset': { borderColor: alpha(PRIMARY_COLOR, 0.6) },
                                                '&.Mui-focused fieldset': { borderColor: PRIMARY_COLOR, borderWidth: 1.5 },
                                            },
                                            '& input': { color: hasVal ? PRIMARY_COLOR : '#0F172A', fontWeight: hasVal ? 600 : 400, fontSize: '0.8rem' },
                                            '& input::placeholder': { color: '#94A3B8', opacity: 1 },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchOutlinedIcon sx={{ fontSize: 14, color: hasVal ? PRIMARY_COLOR : '#94A3B8' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                );
                            })}

                            {/* Spacer */}
                            <Box sx={{ flex: 1 }} />

                            {/* Apply / Clear */}
                            <Stack direction="row" gap={1} alignItems="center" flexShrink={0}>
                                {activeFilterCount > 0 && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={handleClearAll}
                                        sx={{
                                            height: 34, px: 1.75, borderRadius: '8px',
                                            textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                                            color: '#64748B', borderColor: '#E2E8F0',
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
                                    startIcon={<TuneOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                                    sx={{
                                        height: 34, px: 2, borderRadius: '8px',
                                        textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
                                        bgcolor: PRIMARY_COLOR,
                                        boxShadow: `0 2px 8px ${alpha(PRIMARY_COLOR, 0.30)}`,
                                        '&:hover': {
                                            bgcolor: '#065E53',
                                            boxShadow: `0 4px 14px ${alpha(PRIMARY_COLOR, 0.40)}`,
                                            transform: 'translateY(-1px)',
                                        },
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    Apply Filters
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Collapse>
            )}
        </StyledToolbarContainer>
    );
};

const CustomToolbarWrapper: React.FC<CustomToolbarWrapperProps> = (props) => {
    return <TableToolBar {...props} />;
};

export default CustomToolbarWrapper;

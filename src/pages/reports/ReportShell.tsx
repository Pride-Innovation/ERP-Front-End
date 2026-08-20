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
import ScheduleSendOutlinedIcon from '@mui/icons-material/ScheduleSendOutlined';
import dayjs from 'dayjs';
import useReportLookups, { LookupOption } from './useReportLookups';
import { ReportColumn } from './ReportDataTable';
import { exportReportPdf, exportReportExcel, exportReportCsv } from './exportReport';

const PRIMARY = '#08796C';

/**
 * What the filter bar emits.
 *
 * <p>Ids and labels travel together on purpose. Every backend filter takes an id
 * (`assetTypeId`, `assetStatusId`, `locationId`), while the heading of an exported report and any
 * client-side matching want the name. Emitting only labels — as this did — meant nothing the bar
 * produced could be sent to a server-side query.
 */
export interface ReportShellFilters {
    dateFrom?: string;
    dateTo?: string;
    branchId?: number | string;
    branch?: string;
    departmentId?: number | string;
    department?: string;
    categoryId?: number | string;
    category?: string;
    statusId?: number | string;
    /** The status's stable camelCase code — what client-side matching compares against. */
    statusCode?: string;
    status?: string;
    schedule?: string;
}

interface ReportShellProps {
    title: string;
    subtitle?: string;
    accentColor: string;
    filterFields?: Array<'dateRange' | 'branch' | 'department' | 'category' | 'status'>;
    onApplyFilters?: (f: ReportShellFilters) => void;
    /** Override the built-in export for a report that needs a bespoke document. */
    onExportPdf?: () => void;
    onExportExcel?: () => void;
    onExportCsv?: () => void;
    onRefresh?: () => void;
    summaryCards?: React.ReactNode;
    /**
     * The rows and columns currently on screen. Given these, the shell exports on the panel's
     * behalf — so every report writes the same branded PDF and the same spreadsheet, and an export
     * always matches what the reader is looking at, filters included.
     */
    exportRows?: any[];
    exportColumns?: ReportColumn<any>[];
    children: React.ReactNode;
}

const DATE_PRESETS = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Quarter', value: 'quarter' },
    { label: 'This Year', value: 'year' },
    { label: 'Custom', value: 'custom' },
];

const SCHEDULES = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
];

// Branch / department / category / status options now come from the live directories via
// useReportLookups. They used to be four hardcoded arrays of names here — a fixed five branches
// that bore no relation to the bank's actual estate, and labels that could not be used to query.

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

const ReportShell = ({
    title,
    subtitle,
    accentColor,
    filterFields = ['dateRange', 'branch', 'department', 'category', 'status'],
    onApplyFilters,
    onExportPdf,
    onExportExcel,
    onExportCsv,
    onRefresh,
    summaryCards,
    exportRows,
    exportColumns,
    children,
}: ReportShellProps) => {
    const [showFilters, setShowFilters] = useState(true);
    const [datePreset, setDatePreset] = useState('month');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [branch, setBranch] = useState('');
    const [department, setDepartment] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const [schedule, setSchedule] = useState('');
    const [showSchedule, setShowSchedule] = useState(false);

    /** Live branch / department / category / status directories for the four dropdowns. */
    const lookups = useReportLookups();

    /** Resolves a selected id back to its directory entry, so the emitted filter carries both. */
    const pick = (options: LookupOption[], id: string) => options.find((o) => String(o.id) === String(id));

    const handleApply = () => {
        const range = datePreset !== 'custom' ? getDateRange(datePreset) : { from: customFrom, to: customTo };
        const b = pick(lookups.branches, branch);
        const d = pick(lookups.departments, department);
        const c = pick(lookups.categories, category);
        const s = pick(lookups.statuses, status);

        onApplyFilters?.({
            dateFrom: range.from,
            dateTo: range.to,
            branchId: b?.id,
            branch: b?.label,
            departmentId: d?.id,
            department: d?.label,
            categoryId: c?.id,
            category: c?.label,
            statusId: s?.id,
            statusCode: s?.code,
            status: s?.label,
            schedule: schedule || undefined,
        });
    };

    /**
     * Exports what is on screen. Reads the current filter controls rather than the last applied
     * set, so an export taken before pressing Apply still describes itself accurately.
     */
    const runExport = (kind: 'pdf' | 'excel' | 'csv') => {
        if (!exportRows || !exportColumns) return;
        const range = datePreset !== 'custom' ? getDateRange(datePreset) : { from: customFrom, to: customTo };
        const input = {
            title,
            columns: exportColumns,
            rows: exportRows,
            filters: {
                dateFrom: range.from,
                dateTo: range.to,
                branch: pick(lookups.branches, branch)?.label,
                department: pick(lookups.departments, department)?.label,
                category: pick(lookups.categories, category)?.label,
                status: pick(lookups.statuses, status)?.label,
            },
        };
        if (kind === 'pdf') exportReportPdf(input);
        else if (kind === 'excel') exportReportExcel(input);
        else exportReportCsv(input);
    };

    const handleClear = () => {
        setDatePreset('month');
        setCustomFrom('');
        setCustomTo('');
        setBranch('');
        setDepartment('');
        setCategory('');
        setStatus('');
        setSchedule('');
        onApplyFilters?.({});
    };

    return (
        <Box>
            {/* ── Summary metric cards ─────────────────────────────── */}
            {summaryCards && (
                <Box sx={{ mb: 3 }}>{summaryCards}</Box>
            )}

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
                    bgcolor: alpha(accentColor, 0.03),
                }}>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <TuneOutlinedIcon sx={{ fontSize: 16, color: accentColor }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>
                            Filters &amp; Options
                        </Typography>
                    </Stack>
                    <Stack direction="row" gap={0.5}>
                        <Tooltip title="Schedule report">
                            <IconButton size="small" onClick={() => setShowSchedule(p => !p)}
                                sx={{ color: showSchedule ? accentColor : '#64748B', bgcolor: showSchedule ? alpha(accentColor, 0.08) : 'transparent' }}>
                                <ScheduleSendOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={showFilters ? 'Collapse filters' : 'Expand filters'}>
                            <IconButton size="small" onClick={() => setShowFilters(p => !p)}
                                sx={{ color: '#64748B' }}>
                                <FilterAltOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>

                <Collapse in={showFilters}>
                    <Box sx={{ px: 2.5, py: 2 }}>
                        <Grid container spacing={1.5} alignItems="flex-end">

                            {/* Date preset */}
                            {filterFields.includes('dateRange') && (
                                <Grid item xs={12} sm={6} md={2}>
                                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Period
                                    </Typography>
                                    <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                        <Select value={datePreset} onChange={e => setDatePreset(e.target.value)}
                                            startAdornment={<InputAdornment position="start"><CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: accentColor }} /></InputAdornment>}>
                                            {DATE_PRESETS.map(d => <MenuItem key={d.value} value={d.value} sx={{ fontSize: '0.8rem' }}>{d.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {/* Custom date range */}
                            {filterFields.includes('dateRange') && datePreset === 'custom' && (
                                <>
                                    <Grid item xs={6} sm={3} md={1.5}>
                                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>From</Typography>
                                        <TextField fullWidth size="small" type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} sx={PILL_INPUT_SX} />
                                    </Grid>
                                    <Grid item xs={6} sm={3} md={1.5}>
                                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>To</Typography>
                                        <TextField fullWidth size="small" type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} sx={PILL_INPUT_SX} />
                                    </Grid>
                                </>
                            )}

                            {/* Branch */}
                            {filterFields.includes('branch') && (
                                <Grid item xs={12} sm={6} md={2}>
                                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Branch</Typography>
                                    <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                        <Select value={branch} onChange={e => setBranch(e.target.value)} displayEmpty>
                                            <MenuItem value=""><em style={{ fontSize: '0.8rem', fontStyle: 'normal', color: '#94A3B8' }}>All Branches</em></MenuItem>
                                            {lookups.branches.map(b => <MenuItem key={b.id} value={String(b.id)} sx={{ fontSize: '0.8rem' }}>{b.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {/* Department */}
                            {filterFields.includes('department') && (
                                <Grid item xs={12} sm={6} md={2}>
                                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</Typography>
                                    <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                        <Select value={department} onChange={e => setDepartment(e.target.value)} displayEmpty>
                                            <MenuItem value=""><em style={{ fontSize: '0.8rem', fontStyle: 'normal', color: '#94A3B8' }}>All Departments</em></MenuItem>
                                            {lookups.departments.map(d => <MenuItem key={d.id} value={String(d.id)} sx={{ fontSize: '0.8rem' }}>{d.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {/* Category */}
                            {filterFields.includes('category') && (
                                <Grid item xs={12} sm={6} md={2}>
                                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</Typography>
                                    <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                        <Select value={category} onChange={e => setCategory(e.target.value)} displayEmpty>
                                            <MenuItem value=""><em style={{ fontSize: '0.8rem', fontStyle: 'normal', color: '#94A3B8' }}>All Categories</em></MenuItem>
                                            {lookups.categories.map(c => <MenuItem key={c.id} value={String(c.id)} sx={{ fontSize: '0.8rem' }}>{c.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {/* Status */}
                            {filterFields.includes('status') && (
                                <Grid item xs={12} sm={6} md={2}>
                                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</Typography>
                                    <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                        <Select value={status} onChange={e => setStatus(e.target.value)} displayEmpty>
                                            <MenuItem value=""><em style={{ fontSize: '0.8rem', fontStyle: 'normal', color: '#94A3B8' }}>All Statuses</em></MenuItem>
                                            {lookups.statuses.map(s => <MenuItem key={s.id} value={String(s.id)} sx={{ fontSize: '0.8rem' }}>{s.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {/* Schedule (collapsible) */}
                            {showSchedule && (
                                <Grid item xs={12} sm={6} md={2}>
                                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Schedule</Typography>
                                    <FormControl fullWidth size="small" sx={PILL_INPUT_SX}>
                                        <Select value={schedule} onChange={e => setSchedule(e.target.value)} displayEmpty>
                                            <MenuItem value=""><em style={{ fontSize: '0.8rem', fontStyle: 'normal', color: '#94A3B8' }}>One-time</em></MenuItem>
                                            {SCHEDULES.map(s => <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>{s.label}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {/* Action buttons */}
                            <Grid item xs={12} sm="auto">
                                <Stack direction="row" gap={1} sx={{ mt: { xs: 0.5, md: 0 } }}>
                                    <Button
                                        size="small" variant="contained"
                                        onClick={handleApply}
                                        sx={{
                                            height: 36, px: 2, textTransform: 'none', fontWeight: 600,
                                            fontSize: '0.8rem', bgcolor: accentColor, borderRadius: '8px',
                                            boxShadow: `0 2px 8px ${alpha(accentColor, 0.35)}`,
                                            '&:hover': { bgcolor: alpha(accentColor, 0.85), boxShadow: `0 4px 14px ${alpha(accentColor, 0.4)}` },
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
                                            '&:hover': { borderColor: accentColor, color: accentColor, bgcolor: alpha(accentColor, 0.04) },
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
                        onClick={onExportPdf ?? (() => runExport('pdf'))}
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
                        onClick={onExportExcel ?? (() => runExport('excel'))}
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
                        onClick={onExportCsv ?? (() => runExport('csv'))}
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
                            '&:hover': { borderColor: accentColor, color: accentColor, bgcolor: alpha(accentColor, 0.05) },
                        }}>
                        <RefreshOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* ── Report content slot ─────────────────────────────────── */}
            {children}
        </Box>
    );
};

export default ReportShell;

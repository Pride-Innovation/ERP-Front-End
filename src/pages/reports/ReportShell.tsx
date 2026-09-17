import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
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
}

/*
 * There was a `schedule` field here, and a Daily / Weekly / Monthly picker behind a clock icon in
 * the filter header, emitted on every Apply. **No panel ever read it**, and nothing anywhere
 * scheduled anything — the page hero still advertised "Generate, schedule and export".
 *
 * Removed rather than left in place. A control that silently does nothing is worse than an absent
 * feature: somebody sets it, believes a report is now arriving weekly, and stops checking. If
 * scheduled reports are wanted they need a server that can run and deliver one, which is a feature
 * rather than a dropdown.
 */

interface ReportShellProps {
    title: string;
    subtitle?: string;
    accentColor: string;
    filterFields?: Array<'dateRange' | 'branch' | 'department' | 'category' | 'status'>;
    /**
     * Statuses this report actually uses, when they are not the ones in the status catalogue.
     *
     * <h2>Why this had to exist</h2>
     * The Status dropdown was filled from `GET /statuses` — the Status *entity*, which carries
     * request and asset states ("Request Approved", "In Store"). A **movement**'s status is a
     * different vocabulary entirely: its own enum of DRAFT / DISPATCHED / IN_TRANSIT / … So the
     * Movement report offered a list of statuses no movement can ever hold, and picking any of them
     * matched nothing. Not an error — an empty table, which reads as "there are none of those".
     *
     * <p>A report whose subject has its own states passes them here; everything else keeps the
     * catalogue.
     */
    statusOptions?: LookupOption[];
    /**
     * Something the reader has to know before trusting the figures — currently, that the report read
     * less than the server holds.
     *
     * <p>Above the table rather than inside it, because it qualifies the summary cards and the
     * export as much as the rows.
     */
    notice?: string | null;
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

// Branch / department / category / status options now come from the live directories via
// useReportLookups. They used to be four hardcoded arrays of names here — a fixed five branches
// that bore no relation to the bank's actual estate, and labels that could not be used to query.

/**
 * Local wall-clock, the format every endpoint in this application expects.
 *
 * <h2>Why not `toISOString()`</h2>
 * That produces UTC with a trailing `Z`, and Spring binds it to a `LocalDateTime` **without
 * complaining and discards the offset** — so the instant is re-read as a wall-clock time. On a
 * +03:00 server "Today" then searched from **21:00 the previous day**: last night's records wrongly
 * included, the last three hours of today wrongly excluded. No error, no empty table, just a
 * slightly wrong answer, which is why it has to be looked for rather than noticed.
 *
 * <p>The movements panel was fixed for exactly this; the reports page never got the same treatment.
 */
const wire = (d: dayjs.Dayjs): string => d.format('YYYY-MM-DDTHH:mm:ss');

const getDateRange = (preset: string): { from: string; to: string } => {
    const now = dayjs();
    switch (preset) {
        case 'today': return { from: wire(now.startOf('day')), to: wire(now.endOf('day')) };
        case 'week': return { from: wire(now.startOf('week')), to: wire(now.endOf('week')) };
        case 'month': return { from: wire(now.startOf('month')), to: wire(now.endOf('month')) };
        case 'quarter': {
            const month = now.month();
            const quarterStart = now.month(Math.floor(month / 3) * 3).startOf('month');
            const quarterEnd = quarterStart.add(2, 'month').endOf('month');
            return { from: wire(quarterStart), to: wire(quarterEnd) };
        }
        case 'year': return { from: wire(now.startOf('year')), to: wire(now.endOf('year')) };
        default: return { from: '', to: '' };
    }
};

/**
 * The custom From / To boxes, in the same format and with the same day boundaries as a preset.
 *
 * <h2>Two bugs this closes</h2>
 * The boxes are `type="date"`, so they produce a bare `YYYY-MM-DD` while every preset produced a
 * full timestamp — **the same filter field carried two different formats depending on how it was
 * set.** And a bare date is midnight, so a "To" of the 14th excluded everything that happened *on*
 * the 14th; the report quietly lost its last day.
 *
 * <p>Widened to the whole day at both ends, so "1st to 14th" means what a reader means by it.
 */
const customRange = (from: string, to: string): { from: string; to: string } => ({
    from: from ? wire(dayjs(from).startOf('day')) : '',
    to: to ? wire(dayjs(to).endOf('day')) : '',
});

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
    statusOptions,
    notice,
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

    /** Live branch / department / category / status directories for the four dropdowns. */
    const lookups = useReportLookups();

    /** The catalogue, unless this report's subject has a vocabulary of its own. */
    const statusChoices = statusOptions ?? lookups.statuses;

    /** Resolves a selected id back to its directory entry, so the emitted filter carries both. */
    const pick = (options: LookupOption[], id: string) => options.find((o) => String(o.id) === String(id));

    /** Exactly what the controls currently say, in the shape the panels consume. */
    const currentFilters = useCallback((): ReportShellFilters => {
        const range = datePreset !== 'custom' ? getDateRange(datePreset) : customRange(customFrom, customTo);
        const b = pick(lookups.branches, branch);
        const d = pick(lookups.departments, department);
        const c = pick(lookups.categories, category);
        const s = pick(statusChoices, status);

        return {
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
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [datePreset, customFrom, customTo, branch, department, category, status, lookups]);

    const handleApply = () => onApplyFilters?.(currentFilters());

    /*
     * The bar opens reading "This Month" — so that is what the first table must show.
     *
     * It did not. The panel started from an empty filter set and loaded everything, under a Period
     * control confidently naming a month. Nobody reading the page could tell: it is not an error
     * state, it is a heading that disagrees with the table beneath it, and the table looks perfectly
     * plausible.
     *
     * Applied once the lookups have arrived, because the branch and status ids come from them —
     * firing earlier would send a date range and silently drop everything else.
     */
    const primed = useRef(false);
    useEffect(() => {
        if (primed.current || lookups.loading) return;
        primed.current = true;
        onApplyFilters?.(currentFilters());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lookups.loading]);

    /**
     * Exports what is on screen. Reads the current filter controls rather than the last applied
     * set, so an export taken before pressing Apply still describes itself accurately.
     */
    const runExport = (kind: 'pdf' | 'excel' | 'csv') => {
        if (!exportRows || !exportColumns) return;
        const range = datePreset !== 'custom' ? getDateRange(datePreset) : customRange(customFrom, customTo);
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
                status: pick(statusChoices, status)?.label,
            },
        };
        if (kind === 'pdf') exportReportPdf(input);
        else if (kind === 'excel') exportReportExcel(input);
        else exportReportCsv(input);
    };

    /**
     * Back to the opening state — which is "this month", not "everything".
     *
     * <p>It used to reset the controls to *This Month* and then apply an **empty** filter set, so
     * Clear left the bar and the table disagreeing permanently. Clearing should mean "put it back
     * how it opened", and what it opened as is now one definition rather than two.
     */
    const handleClear = () => {
        setDatePreset('month');
        setCustomFrom('');
        setCustomTo('');
        setBranch('');
        setDepartment('');
        setCategory('');
        setStatus('');
        onApplyFilters?.({
            dateFrom: getDateRange('month').from,
            dateTo: getDateRange('month').to,
        });
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
                                            {statusChoices.map(s => <MenuItem key={s.id} value={String(s.id)} sx={{ fontSize: '0.8rem' }}>{s.label}</MenuItem>)}
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

            {notice && (
                <Alert severity="warning" sx={{ mb: 2, py: 0.5 }}>{notice}</Alert>
            )}

            {/* ── Report content slot ─────────────────────────────────── */}
            {children}
        </Box>
    );
};

export default ReportShell;

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box, Button, Chip, CircularProgress, LinearProgress, Link, ListItemIcon, ListItemText, Menu, MenuItem,
    Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow,
    TextField, Typography, alpha,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import { toast } from 'react-toastify';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';

import { useDebounce } from '../../hooks/useDebounce';
import { brand, neutral, border, radii, status as statusTokens } from '../../utils/tokens';
import { ADJUSTMENT_REASONS, AdjustmentReason, IVarianceReport, adjustmentReasonLabel } from './stockTakeInterface';
import {
    AdjustmentExportFormat, EMPTY_ADJUSTMENT_FILTERS, IAdjustmentFilters,
    exportAdjustments, fetchAdjustmentPage, toAdjustmentParams,
} from './stockAdjustments';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const selectSx = {
    minWidth: 150,
    '& .MuiOutlinedInput-root': { borderRadius: `${radii.md}px`, bgcolor: '#fff' },
};

/** Every reason a history row can carry, including the reversal no counter may choose. */
const REASON_OPTIONS: { value: AdjustmentReason; label: string }[] = [
    ...ADJUSTMENT_REASONS.map((r) => ({ value: r.value, label: r.label })),
    { value: 'STOCK_REVERSAL', label: adjustmentReasonLabel('STOCK_REVERSAL') },
];

interface Props {
    /** Only a viewer who sees every branch has more than one to choose between. */
    seesEveryBranch: boolean;
    /** Count id by reference, so a row's count opens; a reversal names none. */
    countIdByReference: Map<string, number>;
    onOpenCount: (countId: number) => void;
}

/**
 * Every balance correction, filtered, paged and exported by the server.
 *
 * <p>It used to load the whole history and draw it on one page with no filter and no export. The
 * history grows with every count line that differs and every reversed stock order, so it now asks for
 * one page at a time. The totals in the header are over everything matching, not the page.
 */
const AdjustmentHistory = ({ seesEveryBranch, countIdByReference, onOpenCount }: Props) => {
    const [filters, setFilters] = useState<IAdjustmentFilters>(EMPTY_ADJUSTMENT_FILTERS);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [report, setReport] = useState<IVarianceReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [exportAnchor, setExportAnchor] = useState<HTMLElement | null>(null);
    const [exporting, setExporting] = useState(false);
    const ticket = useRef(0);

    const debouncedSearch = useDebounce(filters.search, 400);
    // The search waits for the typing to stop; everything else applies at once.
    const effective = useMemo(() => ({ ...filters, search: debouncedSearch }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [filters.storeId, filters.branchId, filters.reason, filters.assetTypeId, filters.from, filters.to, debouncedSearch]);

    useEffect(() => {
        // A slow earlier reply must not overwrite a later one.
        const mine = ++ticket.current;
        setLoading(true);
        fetchAdjustmentPage(toAdjustmentParams(effective, page, rowsPerPage))
            .then((r) => { if (mine === ticket.current) { setReport(r); setFailed(false); } })
            .catch(() => { if (mine === ticket.current) { setReport(null); setFailed(true); } })
            .finally(() => { if (mine === ticket.current) setLoading(false); });
    }, [effective, page, rowsPerPage]);

    // A new filter starts from the first page, or the table could open on a page that no longer exists.
    useEffect(() => { setPage(0); }, [effective, rowsPerPage]);

    const setFilter = <K extends keyof IAdjustmentFilters>(key: K, value: IAdjustmentFilters[K]) =>
        setFilters((f) => ({ ...f, [key]: value }));
    const hasFilters = Object.values(filters).some((v) => v !== '');

    const stores = report?.storeOptions ?? [];
    const branches = useMemo(() => {
        const seen = new Map<number, string>();
        stores.forEach((s) => { if (s.branchId != null && s.branchName) seen.set(s.branchId, s.branchName); });
        return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    }, [stores]);
    // A store list narrowed by the chosen branch, so the two filters cannot contradict each other.
    const storeChoices = filters.branchId ? stores.filter((s) => String(s.branchId) === filters.branchId) : stores;

    const runExport = async (format: AdjustmentExportFormat) => {
        setExportAnchor(null);
        setExporting(true);
        try {
            await exportAdjustments(format, effective, report);
        } catch {
            toast.error('The export could not be produced. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    const rows = report?.adjustments ?? [];
    const total = report?.totalLines ?? 0;

    return (
        <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden' }}>
            {/* Header */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between" sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${border.subtle}` }}>
                <Box>
                    <Typography sx={{ fontWeight: 700, color: neutral[900] }}>Adjustment History</Typography>
                    <Typography variant="caption" sx={{ color: neutral[500] }}>
                        Every balance correction, with the reason it was made
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    {/* Over every match, not this page - so they hold however you page. */}
                    {report && (
                        <>
                            <Chip size="small" label={`${total} adjustment${total === 1 ? '' : 's'}${hasFilters ? ' match' : ''}`}
                                sx={{ height: 24, fontWeight: 700, bgcolor: alpha(brand[500], 0.1), color: brand[700] }} />
                            {report.unitsWrittenUp > 0 && (
                                <Chip size="small" label={`+${report.unitsWrittenUp} units`}
                                    sx={{ height: 24, fontWeight: 700, bgcolor: statusTokens.success.soft, color: statusTokens.success.strong }} />
                            )}
                            {report.unitsWrittenDown > 0 && (
                                <Chip size="small" label={`−${report.unitsWrittenDown} units`}
                                    sx={{ height: 24, fontWeight: 700, bgcolor: statusTokens.danger.soft, color: statusTokens.danger.strong }} />
                            )}
                        </>
                    )}
                    <Button size="small" variant="outlined" disabled={exporting || total === 0}
                        startIcon={exporting ? <CircularProgress size={14} /> : <FileDownloadOutlinedIcon sx={{ fontSize: 17 }} />}
                        onClick={(e) => setExportAnchor(e.currentTarget)}
                        sx={{ height: 32, borderRadius: `${radii.md}px`, textTransform: 'none', fontWeight: 600, borderColor: alpha(brand[500], 0.4), color: brand[700] }}>
                        Export
                    </Button>
                    <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
                        <MenuItem onClick={() => runExport('pdf')}>
                            <ListItemIcon><PictureAsPdfOutlinedIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="PDF" secondary="Printable, with the active filters" />
                        </MenuItem>
                        <MenuItem onClick={() => runExport('excel')}>
                            <ListItemIcon><GridOnOutlinedIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Excel" />
                        </MenuItem>
                        <MenuItem onClick={() => runExport('csv')}>
                            <ListItemIcon><DescriptionOutlinedIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="CSV" />
                        </MenuItem>
                    </Menu>
                </Stack>
            </Stack>

            {/* Filters */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', md: 'center' }}
                flexWrap="wrap" useFlexGap
                sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${border.subtle}`, bgcolor: alpha(brand[500], 0.02) }}>
                <TextField size="small" placeholder="Search commodity…" value={filters.search}
                    onChange={(e) => setFilter('search', e.target.value)}
                    InputProps={{ startAdornment: <SearchOutlinedIcon sx={{ fontSize: 17, color: neutral[400], mr: 0.75 }} /> }}
                    sx={{ minWidth: 200, flexGrow: 1, maxWidth: { md: 260 }, '& .MuiOutlinedInput-root': { borderRadius: `${radii.md}px`, bgcolor: '#fff' } }} />
                {seesEveryBranch && branches.length > 1 && (
                    <TextField select size="small" label="Branch" value={filters.branchId}
                        onChange={(e) => setFilters((f) => ({ ...f, branchId: e.target.value, storeId: '' }))} sx={selectSx}>
                        <MenuItem value="">All branches</MenuItem>
                        {branches.map(([id, name]) => <MenuItem key={id} value={String(id)}>{name}</MenuItem>)}
                    </TextField>
                )}
                {storeChoices.length > 1 && (
                    <TextField select size="small" label="Store" value={filters.storeId}
                        onChange={(e) => setFilter('storeId', e.target.value)} sx={{ ...selectSx, minWidth: 180 }}>
                        <MenuItem value="">All stores</MenuItem>
                        {storeChoices.map((s) => (
                            <MenuItem key={s.id} value={String(s.id)}>
                                {s.name}{seesEveryBranch && s.branchName ? ` · ${s.branchName}` : ''}
                            </MenuItem>
                        ))}
                    </TextField>
                )}
                <TextField select size="small" label="Reason" value={filters.reason}
                    onChange={(e) => setFilter('reason', e.target.value as IAdjustmentFilters['reason'])} sx={selectSx}>
                    <MenuItem value="">All reasons</MenuItem>
                    {REASON_OPTIONS.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
                </TextField>
                {(report?.categoryOptions?.length ?? 0) > 1 && (
                    <TextField select size="small" label="Category" value={filters.assetTypeId}
                        onChange={(e) => setFilter('assetTypeId', e.target.value)} sx={selectSx}>
                        <MenuItem value="">All categories</MenuItem>
                        {report!.categoryOptions!.map((c) => <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>)}
                    </TextField>
                )}
                <TextField size="small" type="date" label="Posted from" value={filters.from}
                    onChange={(e) => setFilter('from', e.target.value)} InputLabelProps={{ shrink: true }}
                    inputProps={{ max: filters.to || undefined }} sx={selectSx} />
                <TextField size="small" type="date" label="Posted to" value={filters.to}
                    onChange={(e) => setFilter('to', e.target.value)} InputLabelProps={{ shrink: true }}
                    inputProps={{ min: filters.from || undefined }} sx={selectSx} />
                {hasFilters && (
                    <Button size="small" startIcon={<FilterListOffIcon sx={{ fontSize: 17 }} />}
                        onClick={() => setFilters(EMPTY_ADJUSTMENT_FILTERS)}
                        sx={{ textTransform: 'none', fontWeight: 600, color: neutral[600] }}>
                        Clear filters
                    </Button>
                )}
            </Stack>

            {/* A thin bar while a page reloads, so the table stays in place rather than blinking out. */}
            <Box sx={{ height: 3 }}>
                {loading && report && <LinearProgress sx={{ height: 3, '& .MuiLinearProgress-bar': { bgcolor: brand[500] }, bgcolor: alpha(brand[500], 0.12) }} />}
            </Box>

            {loading && !report ? (
                <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={24} sx={{ color: brand[500] }} /></Stack>
            ) : failed ? (
                // Said, not shown as an empty table: "could not be read" and "there are none" differ.
                <Typography sx={{ px: 2.5, py: 4, textAlign: 'center', color: neutral[500] }}>
                    The adjustment history could not be loaded.
                </Typography>
            ) : (
                <>
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table size="small" sx={{ minWidth: 900 }}>
                            <TableHead>
                                <TableRow sx={{ '& th': { bgcolor: alpha(brand[500], 0.04), borderBottom: `1px solid ${border.subtle}`, fontWeight: 700, fontSize: '0.8rem', color: brand[700], textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.4, whiteSpace: 'nowrap' } }}>
                                    <TableCell>Commodity</TableCell>
                                    <TableCell>Store</TableCell>
                                    <TableCell align="center">Before</TableCell>
                                    <TableCell align="center">After</TableCell>
                                    <TableCell align="center">Change</TableCell>
                                    <TableCell>Reason</TableCell>
                                    <TableCell>Count</TableCell>
                                    <TableCell>Posted</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4, color: neutral[500] }}>
                                            {hasFilters ? 'No adjustments match these filters.' : 'No adjustments have been posted yet.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {rows.map((a) => (
                                    <TableRow key={a.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: alpha(neutral[900], 0.012) }, '& td': { borderBottom: `1px solid ${alpha(neutral[900], 0.05)}`, py: 1.2, fontSize: '0.875rem' } }}>
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 600, color: neutral[900], fontSize: '0.875rem' }}>{a.commodityName}</Typography>
                                            {a.assetTypeName && <Typography sx={{ fontSize: '0.8rem', color: neutral[500] }}>{a.assetTypeName}</Typography>}
                                        </TableCell>
                                        <TableCell sx={{ color: neutral[600] }}>
                                            {a.storeName}
                                            {seesEveryBranch && a.branchName && <Typography sx={{ fontSize: '0.8rem', color: neutral[500] }}>{a.branchName}</Typography>}
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontVariantNumeric: 'tabular-nums' }}>{a.quantityBefore}</TableCell>
                                        <TableCell align="center" sx={{ fontVariantNumeric: 'tabular-nums' }}>{a.quantityAfter}</TableCell>
                                        <TableCell align="center">
                                            <Chip size="small" label={a.quantityDelta > 0 ? `+${a.quantityDelta}` : a.quantityDelta}
                                                sx={{
                                                    height: 21, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                                                    bgcolor: a.quantityDelta > 0 ? statusTokens.success.soft : statusTokens.danger.soft,
                                                    color: a.quantityDelta > 0 ? statusTokens.success.strong : statusTokens.danger.strong,
                                                }} />
                                        </TableCell>
                                        <TableCell sx={{ color: neutral[700] }}>
                                            {adjustmentReasonLabel(a.reason)}
                                            {a.note && <Typography sx={{ fontSize: '0.8rem', color: neutral[500] }}>{a.note}</Typography>}
                                        </TableCell>
                                        {/* A reversal comes from a deleted stock order and belongs to no count. */}
                                        <TableCell sx={{ color: neutral[500], fontSize: '0.8rem' }}>
                                            {a.countReference && countIdByReference.has(a.countReference) ? (
                                                <Link component="button" underline="hover"
                                                    onClick={() => onOpenCount(countIdByReference.get(a.countReference as string)!)}
                                                    sx={{ fontSize: '0.8rem', fontWeight: 600, color: brand[700] }}>
                                                    {a.countReference}
                                                </Link>
                                            ) : (a.countReference || '—')}
                                        </TableCell>
                                        <TableCell sx={{ color: neutral[500], fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                            {moment(a.postedAt).format('DD MMM YYYY')}
                                            {a.postedByName && <Typography sx={{ fontSize: '0.8rem', color: neutral[500] }}>{a.postedByName}</Typography>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={total}
                        page={page}
                        onPageChange={(_, p) => setPage(p)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => setRowsPerPage(Number(e.target.value))}
                        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                        sx={{ borderTop: `1px solid ${border.subtle}` }}
                    />
                </>
            )}
        </Paper>
    );
};

export default AdjustmentHistory;

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    LinearProgress,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    TextField,
    Typography,
    alpha,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';

import axiosInstance from '../../core/apis/axiosInstance';
import useAccessScope from '../../core/permissions/useAccessScope';
import { ROUTES } from '../../core/routes/routes';
import { useDebounce } from '../../hooks/useDebounce';
import { StatusChip } from '../../components/layout';
import { reportStatusTone } from '../reports/reportStatus';
import { brand, neutral, border, radii, status as statusTokens } from '../../utils/tokens';
import {
    EMPTY_STORE_ASSET_FILTERS,
    IStoreAssetFilterOptions,
    IStoreAssetFilters,
    IStoreAssetPage,
    IStoreAssetSort,
    StoreAssetExportFormat,
    IStoreSummary,
    exportStoreAssets,
    fetchStoreAssetFilterOptions,
    fetchStoreAssetPage,
    pickLocationStore,
    toStoreAssetParams,
} from './storeAssets';

interface Props {
    branchId?: number | null;
    /** 'ADMIN' | 'IT' | 'DISPOSAL' — the store container whose contents to show. */
    storeType: string;
    accentColor: string;
}

const STORE_LABEL: Record<string, string> = { IT: 'IT Store', ADMIN: 'Admin Store', DISPOSAL: 'Disposal Store' };
const DEFAULT_SORT: IStoreAssetSort = { by: 'assetName', direction: 'ASC' };
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const selectSx = {
    minWidth: 150,
    '& .MuiOutlinedInput-root': { borderRadius: `${radii.md}px`, bgcolor: '#fff' },
};

/**
 * The serialized assets a store is holding.
 *
 * <p>Assets are not {@code StoreBalance} rows — they hang off {@code Asset.currentStore} — so the
 * consumable balance table can never show them. The IT and Disposal stores hold nothing but assets,
 * which is why those pages looked empty however full the stores actually were.
 *
 * <p>Scoped by store container, not by store type: there are 50-odd ADMIN stores, so a type-wide
 * query would show every branch's assets on every branch's page.
 *
 * <h2>Except for the two stores that have no branch</h2>
 * The IT and Disposal stores are singletons for the whole bank and they stand at Head Office. Asking
 * for them by the viewer's own location can only ever match for a Head Office user, so they are looked
 * up by <em>type</em> alone. That does not widen anything: the contents endpoint scopes per viewer,
 * returning a branch only what it owns or sent, and everything to a caller with cross-branch reach.
 *
 * <h2>Filtered and paged on the server</h2>
 * It used to fetch the whole store and draw every row, with a search box as its only filter. It now
 * asks for one page at a time ({@code /assets/page}), after the server has narrowed the store to what
 * this viewer may see - so the page, the totals in the header and the dropdown options all describe
 * the same visible set, and nothing here decides visibility. The export refetches under the same
 * filters rather than writing out the page on screen.
 *
 * <h2>A branch's Admin store also lists what it has away for repair</h2>
 * ADMIN-routed and external repairs are held in the Head Office Admin store, so a branch's chairs
 * leave its own store for one it cannot open. On a branch's Admin page the table asks for them too
 * ({@code includeAwayForRepair}) and a "Held At" column says which store each row is in - one table,
 * as the IT page shows a branch its laptops on the bench. The server decides which rows qualify and
 * reports that it did ({@code awayIncluded}); on Head Office's own Admin page it adds nothing.
 */
const StoreAssetsPanel = ({ branchId, storeType, accentColor }: Props) => {
    const navigate = useNavigate();
    // The same reach the server applies to these stores (`branchScope.canViewAllBranches`).
    const { scopeFor } = useAccessScope();
    const seesEveryBranch = scopeFor('INVENTORY', 'VIEW') === 'ALL';

    const [store, setStore] = useState<IStoreSummary | null>(null);
    const [storeResolved, setStoreResolved] = useState(false);
    const [options, setOptions] = useState<IStoreAssetFilterOptions | null>(null);

    const [filters, setFilters] = useState<IStoreAssetFilters>(EMPTY_STORE_ASSET_FILTERS);
    const [sort, setSort] = useState<IStoreAssetSort>(DEFAULT_SORT);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    const [result, setResult] = useState<IStoreAssetPage | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);
    const [exporting, setExporting] = useState(false);

    const debouncedSearch = useDebounce(filters.search, 400);

    /*
     * One per bank, at Head Office — so the viewer's branch is not part of finding them.
     * Everything else is one store per branch and must be pinned to a location.
     */
    const bankWide = storeType === 'IT' || storeType === 'DISPOSAL';
    // Asked for on every Admin page; the server adds rows only on a branch's own (not Head Office's).
    const includeAway = storeType === 'ADMIN';

    // ── 1. Which store, and what its dropdowns may offer ────────────────────────────────────────
    useEffect(() => {
        setStore(null);
        setStoreResolved(false);
        setOptions(null);
        setResult(null);
        setError(null);
        setFilters(EMPTY_STORE_ASSET_FILTERS);
        setPage(0);

        // A branch-owned store cannot be identified without a branch; a bank-wide one needs none.
        if (!bankWide && !branchId) return;

        let cancelled = false;
        (async () => {
            try {
                const storesRes = await axiosInstance.get('inventory/stores', {
                    params: bankWide ? { storeType } : { locationId: branchId, storeType },
                });
                if (!Array.isArray(storesRes.data)) {
                    throw new Error('The store directory response was not a list');
                }
                const found = pickLocationStore(storesRes.data as IStoreSummary[]);
                if (cancelled) return;
                setStore(found);
                setStoreResolved(true);
                if (found) {
                    // Options failing costs only the dropdowns; the table still loads.
                    fetchStoreAssetFilterOptions(found.id, includeAway)
                        .then((o) => { if (!cancelled) setOptions(o); })
                        .catch(() => { if (!cancelled) setOptions(null); });
                }
            } catch {
                if (!cancelled) {
                    setStoreResolved(true);
                    setError('Could not load the assets held by this store.');
                }
            }
        })();

        return () => { cancelled = true; };
    }, [branchId, storeType, bankWide, includeAway]);

    // ── 2. The page itself ─────────────────────────────────────────────────────────────────────
    // The filters the request is built from, with the search debounced so typing is not a request
    // per keystroke.
    const effectiveFilters = useMemo(
        () => ({ ...filters, search: debouncedSearch }),
        [filters.assetTypeId, filters.statusCode, filters.loanable, filters.originBranchId, debouncedSearch], // eslint-disable-line react-hooks/exhaustive-deps
    );

    useEffect(() => {
        if (!store) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchStoreAssetPage(store.id, toStoreAssetParams(effectiveFilters, page, rowsPerPage, sort, includeAway))
            .then((p) => { if (!cancelled) setResult(p); })
            .catch(() => {
                if (!cancelled) {
                    // The reason replaces the rows rather than sitting beside them: a refusal must not
                    // read as an empty store, nor leave the previous page standing as if it were current.
                    setResult(null);
                    setError('Could not load the assets held by this store.');
                }
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [store, effectiveFilters, page, rowsPerPage, sort, includeAway]);

    // A change of filter starts again from page one — page 4 of a narrower set may not exist.
    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) { firstRender.current = false; return; }
        setPage(0);
    }, [effectiveFilters, rowsPerPage, sort]);

    const setFilter = <K extends keyof IStoreAssetFilters>(key: K, value: IStoreAssetFilters[K]) =>
        setFilters((prev) => ({ ...prev, [key]: value }));

    const hasFilters = Object.values(filters).some((v) => v !== '');
    const clearFilters = () => setFilters(EMPTY_STORE_ASSET_FILTERS);

    const toggleSort = (by: string) =>
        setSort((prev) => prev.by === by
            ? { by, direction: prev.direction === 'ASC' ? 'DESC' : 'ASC' }
            : { by, direction: 'ASC' });

    /*
     * "Sent From" is shown where the server says the store receives other branches' assets - IT,
     * Disposal, and the Head Office Admin store. Falling back to the bank-wide pair only while the
     * options are unread (or the backend predates the flag), which is what this used to hard-code.
     */
    /*
     * A branch on the bank-wide IT or Disposal store sees only what it sent, so "Sent From" would
     * repeat its own name on every row. It gets what its Admin page shows instead: where the item is
     * held and why - "Head Office IT Store · for repair". Head Office, seeing every branch's, keeps
     * "Sent From"; it is the column that tells their rows apart.
     */
    const branchOnSharedStore = bankWide && !seesEveryBranch;
    const awayPurpose = storeType === 'DISPOSAL' ? 'for disposal' : 'for repair';
    const showOrigin = !branchOnSharedStore && (options?.originColumn ?? bankWide);
    const offerOrigin = (options?.originBranches?.length ?? 0) > 0;
    // "Held At" where the table mixes two stores (a branch's own Admin page), or for a branch on a shared store.
    const showHeldAt = options?.awayIncluded === true || branchOnSharedStore;
    const rows = result?.content ?? [];
    const total = result?.totalElements ?? 0;

    const runExport = async (format: StoreAssetExportFormat) => {
        setExportAnchor(null);
        if (!store) return;
        setExporting(true);
        try {
            const title = `${store.name || STORE_LABEL[storeType] || 'Store'} — Assets Held`;
            await exportStoreAssets(format, store.id, effectiveFilters, sort, title, options,
                { includeOrigin: showOrigin, includeAway: includeAway && showHeldAt, includeHeldAt: showHeldAt });
        } catch {
            toast.error('The export could not be produced. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    const sortableHead = (label: string, by: string, align: 'left' | 'center' = 'left') => (
        <TableCell align={align} sortDirection={sort.by === by ? (sort.direction === 'ASC' ? 'asc' : 'desc') : false}>
            <TableSortLabel
                active={sort.by === by}
                direction={sort.by === by ? (sort.direction === 'ASC' ? 'asc' : 'desc') : 'asc'}
                onClick={() => toggleSort(by)}
                sx={{ '&.Mui-active, &:hover': { color: accentColor }, '& .MuiTableSortLabel-icon': { color: `${accentColor} !important` } }}
            >
                {label}
            </TableSortLabel>
        </TableCell>
    );

    return (
        <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden' }}>
            {/* Header */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
                sx={{ px: { xs: 2, md: 3 }, py: 2, borderBottom: `1px solid ${border.subtle}` }}
            >
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{
                        width: 36, height: 36, borderRadius: 1.5, flexShrink: 0,
                        bgcolor: alpha(accentColor, 0.1), color: accentColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <DevicesOutlinedIcon sx={{ fontSize: 19 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.98rem', color: neutral[900] }}>
                            Assets Held
                        </Typography>
                        <Typography variant="caption" sx={{ color: neutral[500] }}>
                            {branchOnSharedStore
                                ? `This branch’s items at the Head Office ${STORE_LABEL[storeType] ?? 'store'}, ${awayPurpose}`
                                : showHeldAt
                                    ? 'Serialized items in this store, and this branch’s items away at Head Office for repair'
                                    : 'Serialized items currently booked into this store'}
                        </Typography>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                    {/* Totals over every match, not this page - so they hold however you page. */}
                    {(result?.loanableTotal ?? 0) > 0 && (
                        <Chip
                            size="small"
                            label={`${result!.loanableTotal} loanable`}
                            sx={{ height: 24, fontWeight: 700, bgcolor: statusTokens.warning.soft, color: statusTokens.warning.strong }}
                        />
                    )}
                    {result && (
                        <Chip
                            size="small"
                            label={`${total} asset${total === 1 ? '' : 's'}${hasFilters ? ' match' : ''}`}
                            sx={{ height: 24, fontWeight: 700, bgcolor: alpha(accentColor, 0.1), color: accentColor }}
                        />
                    )}
                    <Button
                        size="small"
                        variant="outlined"
                        disabled={!store || exporting || total === 0}
                        startIcon={exporting ? <CircularProgress size={14} /> : <FileDownloadOutlinedIcon sx={{ fontSize: 17 }} />}
                        onClick={(e) => setExportAnchor(e.currentTarget)}
                        sx={{ height: 32, borderRadius: `${radii.md}px`, textTransform: 'none', fontWeight: 600, borderColor: alpha(accentColor, 0.4), color: accentColor }}
                    >
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
            {store && (
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1.25}
                    alignItems={{ xs: 'stretch', md: 'center' }}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ px: { xs: 2, md: 3 }, py: 1.5, borderBottom: `1px solid ${border.subtle}`, bgcolor: alpha(accentColor, 0.02) }}
                >
                    <TextField
                        size="small"
                        placeholder="Search name, engraved or serial no…"
                        value={filters.search}
                        onChange={(e) => setFilter('search', e.target.value)}
                        InputProps={{ startAdornment: <SearchOutlinedIcon sx={{ fontSize: 17, color: neutral[400], mr: 0.75 }} /> }}
                        sx={{ minWidth: 240, flexGrow: 1, maxWidth: { md: 320 }, '& .MuiOutlinedInput-root': { borderRadius: `${radii.md}px`, bgcolor: '#fff' } }}
                    />
                    <TextField select size="small" label="Category" value={filters.assetTypeId}
                        onChange={(e) => setFilter('assetTypeId', e.target.value)} sx={selectSx}>
                        <MenuItem value="">All categories</MenuItem>
                        {(options?.categories ?? []).map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </TextField>
                    <TextField select size="small" label="Status" value={filters.statusCode}
                        onChange={(e) => setFilter('statusCode', e.target.value)} sx={selectSx}>
                        <MenuItem value="">All statuses</MenuItem>
                        {(options?.statuses ?? []).map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </TextField>
                    <TextField select size="small" label="Loanable" value={filters.loanable}
                        onChange={(e) => setFilter('loanable', e.target.value as IStoreAssetFilters['loanable'])}
                        sx={{ ...selectSx, minWidth: 120 }}>
                        <MenuItem value="">Any</MenuItem>
                        <MenuItem value="true">Loanable</MenuItem>
                        <MenuItem value="false">Not loanable</MenuItem>
                    </TextField>
                    {offerOrigin && (
                        <TextField select size="small" label="Sent from" value={filters.originBranchId}
                            onChange={(e) => setFilter('originBranchId', e.target.value)} sx={selectSx}>
                            <MenuItem value="">All branches</MenuItem>
                            {options!.originBranches.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                        </TextField>
                    )}
                    {hasFilters && (
                        <Button size="small" startIcon={<FilterListOffIcon sx={{ fontSize: 17 }} />} onClick={clearFilters}
                            sx={{ textTransform: 'none', fontWeight: 600, color: neutral[600] }}>
                            Clear filters
                        </Button>
                    )}
                </Stack>
            )}

            {/* A thin bar while a page reloads, so the table stays in place rather than blinking out. */}
            <Box sx={{ height: 3 }}>{loading && result && <LinearProgress sx={{ height: 3, '& .MuiLinearProgress-bar': { bgcolor: accentColor }, bgcolor: alpha(accentColor, 0.12) }} />}</Box>

            {(!storeResolved || (loading && !result)) && !error && (bankWide || branchId) && (
                <Stack alignItems="center" sx={{ py: 5 }}>
                    <CircularProgress size={26} sx={{ color: accentColor }} />
                </Stack>
            )}

            {error && <Box sx={{ p: 2.5 }}><Alert severity="error">{error}</Alert></Box>}

            {!error && storeResolved && !store && (
                <Stack alignItems="center" spacing={1} sx={{ py: 5, color: neutral[400] }}>
                    <Inventory2OutlinedIcon sx={{ fontSize: 34 }} />
                    <Typography variant="body2">There is no {STORE_LABEL[storeType] ?? 'store'} for this branch.</Typography>
                </Stack>
            )}

            {!error && result && rows.length === 0 && (
                <Stack alignItems="center" spacing={1} sx={{ py: 5, color: neutral[400] }}>
                    <Inventory2OutlinedIcon sx={{ fontSize: 34 }} />
                    <Typography variant="body2">
                        {hasFilters
                            ? 'No assets match these filters.'
                            : showHeldAt
                                ? 'This store is holding no assets, and none of this branch’s are away for repair.'
                                : 'This store is holding no assets.'}
                    </Typography>
                    {hasFilters && (
                        <Button size="small" onClick={clearFilters} sx={{ textTransform: 'none', fontWeight: 600 }}>
                            Clear filters
                        </Button>
                    )}
                </Stack>
            )}

            {!error && result && rows.length > 0 && (
                <>
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table size="small" sx={{ minWidth: 760 }}>
                            <TableHead>
                                <TableRow sx={{
                                    '& th': {
                                        bgcolor: alpha(accentColor, 0.04),
                                        borderBottom: `1px solid ${border.subtle}`,
                                        fontWeight: 700, fontSize: '0.8rem', color: accentColor,
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                        py: 1.4, whiteSpace: 'nowrap',
                                    },
                                }}>
                                    {sortableHead('Asset', 'assetName')}
                                    {sortableHead('Category', 'assetTypeName')}
                                    {sortableHead('Engraved No.', 'engravedNumber')}
                                    {sortableHead('Serial No.', 'serialNumber')}
                                    {sortableHead('Status', 'statusName')}
                                    {showOrigin && sortableHead('Sent From', 'originBranchName')}
                                    {showHeldAt && <TableCell>Held At</TableCell>}
                                    <TableCell align="center">Loanable</TableCell>
                                    <TableCell align="center">Open</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((a) => (
                                    <TableRow
                                        key={a.id}
                                        hover
                                        sx={{
                                            '&:nth-of-type(odd)': { bgcolor: alpha(neutral[900], 0.012) },
                                            '& td': { borderBottom: `1px solid ${alpha(neutral[900], 0.05)}`, py: 1.3, fontSize: '0.875rem' },
                                        }}
                                    >
                                        <TableCell>
                                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: neutral[900] }}>
                                                {a.assetName || '—'}
                                            </Typography>
                                            {a.model && (
                                                <Typography sx={{ fontSize: '0.8rem', color: neutral[500] }}>{a.model}</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ color: neutral[600] }}>{a.assetTypeName || '—'}</TableCell>
                                        <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{a.engravedNumber || '—'}</TableCell>
                                        <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{a.serialNumber || '—'}</TableCell>
                                        <TableCell>
                                            {a.statusName
                                                ? <StatusChip label={a.statusName} tone={reportStatusTone(a.statusCode)} />
                                                : '—'}
                                        </TableCell>
                                        {showOrigin && (
                                            <TableCell sx={{ color: neutral[600] }}>{a.originBranchName || '—'}</TableCell>
                                        )}
                                        {showHeldAt && (
                                            <TableCell>
                                                {branchOnSharedStore || (a.storeId != null && a.storeId !== store?.id) ? (
                                                    // Away at Head Office: said plainly, since the branch cannot walk to it.
                                                    <Chip size="small" label={`${a.storeName || store?.name || 'Head Office'} · ${branchOnSharedStore ? awayPurpose : 'for repair'}`}
                                                        sx={{ height: 22, fontSize: '0.8rem', fontWeight: 600, bgcolor: statusTokens.warning.soft, color: statusTokens.warning.strong }} />
                                                ) : (
                                                    <Typography component="span" sx={{ fontSize: '0.875rem', color: neutral[600] }}>This store</Typography>
                                                )}
                                            </TableCell>
                                        )}
                                        <TableCell align="center">
                                            {a.loanable ? (
                                                <Chip size="small" label="Yes" sx={{ height: 21, fontSize: '0.8rem', fontWeight: 700, bgcolor: statusTokens.warning.soft, color: statusTokens.warning.strong }} />
                                            ) : (
                                                <Typography component="span" sx={{ color: neutral[400] }}>—</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box
                                                component="button"
                                                onClick={() => navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${a.assetTypeId}/view/${a.id}`)}
                                                sx={{
                                                    border: 'none', bgcolor: 'transparent', cursor: 'pointer',
                                                    color: brand[600], display: 'inline-flex', p: 0.5,
                                                    '&:hover': { color: brand[700] },
                                                }}
                                                aria-label={`Open ${a.assetName}`}
                                            >
                                                <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
                                            </Box>
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

export default StoreAssetsPanel;

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Link,
    MenuItem,
    Paper,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Typography,
    alpha,
} from '@mui/material';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import moment from 'moment';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';

import {
    fetchCountableStoresService, fetchStockAdjustmentsService, fetchStockCountsService, openStockCountService,
} from './service';
import { ICountableStore, IStockCount, IVarianceReport, adjustmentReasonLabel } from './stockTakeInterface';
import { canOpenCount, isActionable } from './stockTakeRules';
import {
    STOCK_TAKE_STEPS, StockTakeTab, defaultTab, inTab, isFinished, nextStep,
} from './stockTakeProgress';
import usePermissions from '../../core/permissions/usePermissions';
import useAccessScope from '../../core/permissions/useAccessScope';
import { PERMISSIONS } from '../../core/permissions/constants';
import RoutesUtills from '../../core/routes/utills';
import { ROUTES } from '../../core/routes/routes';
import { PageHero, StatTile } from '../../components/layout';
import { fieldSx } from '../../components/forms/Inputs';
import { brand, neutral, border, radii, status as statusTokens } from '../../utils/tokens';

type IStoreOption = ICountableStore;

const STATUS_TONE: Record<string, { bg: string; fg: string }> = {
    DRAFT: { bg: alpha(neutral[500], 0.12), fg: neutral[700] },
    IN_PROGRESS: { bg: statusTokens.warning.soft, fg: statusTokens.warning.strong },
    SUBMITTED: { bg: statusTokens.info.soft, fg: statusTokens.info.strong },
    APPROVED: { bg: alpha(brand[500], 0.12), fg: brand[700] },
    POSTED: { bg: statusTokens.success.soft, fg: statusTokens.success.strong },
    CANCELLED: { bg: statusTokens.danger.soft, fg: statusTokens.danger.strong },
};

const TAB_LABELS: Record<StockTakeTab, string> = {
    mine: 'Needs my action',
    progress: 'In progress',
    completed: 'Completed',
    all: 'All',
};

/** Stock takes: open a count, follow one through, and read the variance history. */
const StockTake = () => {
    const [counts, setCounts] = useState<IStockCount[]>([]);
    const [report, setReport] = useState<IVarianceReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    /** Null until the viewer picks one, so the page opens on `defaultTab` once the counts are in. */
    const [tab, setTab] = useState<StockTakeTab | null>(null);
    const [branchFilter, setBranchFilter] = useState('');
    const [guideOpen, setGuideOpen] = useState(false);
    const navigate = useNavigate();
    const { has } = usePermissions();
    const { scopeFor } = useAccessScope();
    const currentUserId = (RoutesUtills().getCurrentUser() as { id?: number } | null)?.id ?? null;
    // Opening a count is PERFORM_STOCK_TAKE; reading this page is only READ_STOCK_TAKE.
    const mayOpen = canOpenCount(has);
    // A reader can never be waiting on, so the tab would only ever read zero for them.
    const mayAct = has(PERMISSIONS.PERFORM_STOCK_TAKE) || has(PERMISSIONS.APPROVE_STOCK_TAKE);
    // The counts and adjustment history are both scoped by INVENTORY VIEW on the server.
    const seesEveryBranch = scopeFor('INVENTORY', 'VIEW') === 'ALL';
    const reach = seesEveryBranch ? 'all branches' : 'your branch';

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [c, r] = await Promise.all([
                fetchStockCountsService(),
                fetchStockAdjustmentsService(),
            ]);
            setCounts((c.data as IStockCount[]) ?? []);
            setReport(r.data as IVarianceReport);
        } catch {
            toast.error('Could not load stock takes.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const inFlight = counts.filter((c) => !isFinished(c)).length;

    const tabs: StockTakeTab[] = mayAct ? ['mine', 'progress', 'completed', 'all'] : ['progress', 'completed', 'all'];
    const fallbackTab = defaultTab(counts, has, currentUserId);
    const activeTab = tab ?? (tabs.includes(fallbackTab) ? fallbackTab : 'all');
    const tabSize = (t: StockTakeTab) => counts.filter((c) => inTab(c, t, has, currentUserId)).length;

    const branches = useMemo(
        () => Array.from(new Set(counts.map((c) => c.storeBranchName).filter(Boolean) as string[])).sort(),
        [counts],
    );
    const visible = counts.filter((c) =>
        inTab(c, activeTab, has, currentUserId) && (!branchFilter || c.storeBranchName === branchFilter));

    // An adjustment names its count by reference; a reversal from a deleted stock order names none.
    const countIdByReference = useMemo(() => new Map(counts.map((c) => [c.reference, c.id])), [counts]);

    const openButton = (
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpenDialog(true)}
            sx={{ bgcolor: brand[500], textTransform: 'none', fontWeight: 600, borderRadius: '8px', '&:hover': { bgcolor: brand[700] } }}>
            Open a Count
        </Button>
    );

    return (
        <Box sx={{ minHeight: '100vh', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, pb: 4 }}>
            <PageHero
                title="Stock Take"
                subtitle="Count what is on the shelf and reconcile the balances to it"
                icon={<FactCheckOutlinedIcon />}
                actions={mayOpen ? openButton : undefined}
                stat={{ value: loading ? '…' : String(counts.length), label: 'counts', helper: `${inFlight} in progress` }}
            />

            {/* With nothing yet, the explanation is the page; afterwards it folds away to one line. */}
            {!loading && counts.length === 0 ? (
                <StockTakeGuide
                    expanded
                    footer={(
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                            <Typography variant="body2" sx={{ color: neutral[600] }}>
                                No stock takes yet at {reach}.
                                {mayOpen
                                    ? ' Open a count to check a store against what is physically on its shelves.'
                                    : ' Counts opened by the staff at the shelves will appear here.'}
                            </Typography>
                            {mayOpen && openButton}
                        </Stack>
                    )}
                />
            ) : !loading && (
                <StockTakeGuide expanded={guideOpen} onToggle={() => setGuideOpen((o) => !o)} />
            )}

            <Typography variant="caption" sx={{ display: 'block', color: neutral[500], mb: 1 }}>
                Figures cover counts and adjustments at {reach}.
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                    <StatTile label="Counts In Progress" value={loading ? '…' : inFlight} helper="not yet posted" icon={<RuleOutlinedIcon />} accent="warning" />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatTile label="Adjusted Lines" value={loading ? '…' : (report?.totalLines ?? 0)} helper="all time" icon={<FactCheckOutlinedIcon />} accent="brand" />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatTile label="Units Written Up" value={loading ? '…' : (report?.unitsWrittenUp ?? 0)} helper="found on the shelf" icon={<TrendingUpOutlinedIcon />} accent="info" />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatTile label="Units Written Down" value={loading ? '…' : (report?.unitsWrittenDown ?? 0)} helper="damaged, lost or miscounted" icon={<TrendingDownOutlinedIcon />} accent="gold" />
                </Grid>
            </Grid>

            {loading && <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={26} sx={{ color: brand[500] }} /></Stack>}

            {!loading && counts.length > 0 && (
                <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden', mb: 3 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} justifyContent="space-between"
                        sx={{ px: 2.5, pt: 1.25, borderBottom: `1px solid ${border.subtle}` }}>
                        <Tabs value={activeTab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile
                            sx={{ minHeight: 40, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 40 }, '& .Mui-selected': { color: `${brand[700]} !important` }, '& .MuiTabs-indicator': { bgcolor: brand[500] } }}>
                            {tabs.map((t) => (
                                <Tab key={t} value={t} label={`${TAB_LABELS[t]} (${tabSize(t)})`} />
                            ))}
                        </Tabs>
                        {/* Only Head Office reads more than one branch, so only it has anything to choose between. */}
                        {seesEveryBranch && branches.length > 1 && (
                            <TextField select size="small" label="Branch" value={branchFilter}
                                onChange={(e) => setBranchFilter(e.target.value)}
                                sx={{ ...fieldSx, minWidth: 200, pb: 1 }}>
                                <MenuItem value="">All branches</MenuItem>
                                {branches.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                            </TextField>
                        )}
                    </Stack>
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table size="small" sx={{ minWidth: 800 }}>
                            <TableHead>
                                <TableRow sx={{ '& th': { bgcolor: alpha(brand[500], 0.04), borderBottom: `1px solid ${border.subtle}`, fontWeight: 700, fontSize: '0.8rem', color: brand[700], textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.4, whiteSpace: 'nowrap' } }}>
                                    <TableCell>Reference</TableCell>
                                    <TableCell>Store</TableCell>
                                    <TableCell>Branch</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Next step</TableCell>
                                    <TableCell align="center">Variances</TableCell>
                                    <TableCell>Opened by</TableCell>
                                    <TableCell align="center">Open</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {visible.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4, color: neutral[500] }}>
                                            {activeTab === 'mine' ? 'Nothing is waiting on you.' : 'No counts here.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {visible.map((c) => {
                                    const tone = STATUS_TONE[c.status] ?? STATUS_TONE.DRAFT;
                                    const next = nextStep(c, has, currentUserId);
                                    return (
                                        <TableRow key={c.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: alpha(neutral[900], 0.012) }, '& td': { borderBottom: `1px solid ${alpha(neutral[900], 0.05)}`, py: 1.2, fontSize: '0.875rem' } }}>
                                            <TableCell sx={{ fontWeight: 700, color: neutral[900] }}>{c.reference}</TableCell>
                                            <TableCell sx={{ color: neutral[600] }}>{c.storeName}</TableCell>
                                            <TableCell sx={{ color: neutral[600] }}>{c.storeBranchName || '—'}</TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={0.75} alignItems="center">
                                                    <Chip size="small" label={c.status.replace('_', ' ')} sx={{ height: 21, fontWeight: 700, fontSize: '0.8rem', bgcolor: tone.bg, color: tone.fg }} />
                                                    {/* Another branch's count: readable here, acted on only by that branch. */}
                                                    {!isActionable(c) && (
                                                        <Chip size="small" variant="outlined" label="View only"
                                                            sx={{ height: 21, fontWeight: 600, fontSize: '0.8rem', color: neutral[600], borderColor: border.subtle }} />
                                                    )}
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ color: next.mine ? brand[700] : neutral[600], fontWeight: next.mine ? 700 : 400 }}>
                                                {next.label}
                                            </TableCell>
                                            <TableCell align="center">{c.linesWithVariance || '—'}</TableCell>
                                            <TableCell sx={{ color: neutral[600] }}>{c.countedByName || '—'}</TableCell>
                                            <TableCell align="center">
                                                <IconButton size="small" onClick={() => navigate(`${ROUTES.STOCK_TAKE}/${c.id}`)} sx={{ color: brand[600] }}>
                                                    <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Variance history */}
            {!loading && report && report.adjustments.length > 0 && (
                <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden' }}>
                    <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${border.subtle}` }}>
                        <Typography sx={{ fontWeight: 700, color: neutral[900] }}>Adjustment History</Typography>
                        <Typography variant="caption" sx={{ color: neutral[500] }}>
                            Every balance correction, with the reason it was made
                        </Typography>
                    </Box>
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table size="small" sx={{ minWidth: 800 }}>
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
                                {report.adjustments.map((a, idx) => (
                                    <TableRow key={a.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: alpha(neutral[900], 0.012) }, '& td': { borderBottom: `1px solid ${alpha(neutral[900], 0.05)}`, py: 1.2, fontSize: '0.875rem' } }}>
                                        <TableCell sx={{ fontWeight: 600, color: neutral[900] }}>{a.commodityName}</TableCell>
                                        <TableCell sx={{ color: neutral[600] }}>{a.storeName}</TableCell>
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
                                                    onClick={() => navigate(`${ROUTES.STOCK_TAKE}/${countIdByReference.get(a.countReference as string)}`)}
                                                    sx={{ fontSize: '0.8rem', fontWeight: 600, color: brand[700] }}>
                                                    {a.countReference}
                                                </Link>
                                            ) : (a.countReference || '—')}
                                        </TableCell>
                                        <TableCell sx={{ color: neutral[500], fontSize: '0.8rem' }}>{moment(a.postedAt).format('DD MMM YYYY')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {mayOpen && <OpenCountDialog open={openDialog} onClose={() => setOpenDialog(false)} onOpened={(id) => navigate(`${ROUTES.STOCK_TAKE}/${id}`)} />}
        </Box>
    );
};

/** What a stock take is for and the five steps it goes through. */
const StockTakeGuide = ({ expanded, onToggle, footer }: {
    expanded: boolean; onToggle?: () => void; footer?: ReactNode;
}) => (
    <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', px: 2.5, py: 1.75, mb: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
                <Typography sx={{ fontWeight: 700, color: neutral[900] }}>How a stock take works</Typography>
                <Typography variant="caption" sx={{ color: neutral[500] }}>
                    A stock take checks the system's balances against what is physically on the shelves, and
                    corrects them with a recorded reason.
                </Typography>
            </Box>
            {onToggle && (
                <Button size="small" onClick={onToggle} endIcon={expanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                    sx={{ textTransform: 'none', fontWeight: 600, color: brand[700], flexShrink: 0 }}>
                    {expanded ? 'Hide' : 'Show'}
                </Button>
            )}
        </Stack>
        <Collapse in={expanded}>
            <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                {STOCK_TAKE_STEPS.map((s, i) => (
                    <Grid item xs={12} sm={6} md key={s.label}>
                        <Box sx={{ height: '100%', p: 1.5, borderRadius: 1.5, bgcolor: alpha(brand[500], 0.04), border: `1px solid ${alpha(brand[500], 0.1)}` }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: brand[500], color: '#fff', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {i + 1}
                                </Box>
                                <Typography sx={{ fontWeight: 700, color: neutral[900] }}>{s.label}</Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ color: neutral[600] }}>{s.detail}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
            {footer && <Box sx={{ mt: 2 }}>{footer}</Box>}
        </Collapse>
    </Paper>
);

const OpenCountDialog = ({ open, onClose, onOpened }: {
    open: boolean; onClose: () => void; onOpened: (id: number) => void;
}) => {
    const [stores, setStores] = useState<IStoreOption[]>([]);
    const [store, setStore] = useState<IStoreOption | null>(null);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [loadingStores, setLoadingStores] = useState(false);

    useEffect(() => {
        if (!open) return;
        (async () => {
            // The server's list: stores at the viewer's own branch with something on them to count.
            // It applies the same rule Open does, so nothing offered here can be refused for its store.
            setLoadingStores(true);
            try {
                const res = await fetchCountableStoresService();
                setStores((res.data as IStoreOption[]) ?? []);
            } catch {
                setStores([]);
            } finally {
                setLoadingStores(false);
            }
        })();
        setStore(null);
        setNotes('');
    }, [open]);

    const submit = async () => {
        if (!store) { toast.error('Choose the store to count.'); return; }
        setSaving(true);
        try {
            const res = await openStockCountService({ storeId: store.id, blind: true, notes: notes.trim() || null });
            onOpened((res.data as IStockCount).id);
            onClose();
        } catch {
            // Interceptor shows the server's message — e.g. an unfinished count already exists.
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: `${radii.xl}px` } }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ fontWeight: 700 }}>Open a Stock Count</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Snapshots what the system holds now; nothing changes until you post
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    {!loadingStores && stores.length === 0 ? (
                        <Alert severity="warning" sx={{ borderRadius: 2 }}>
                            No store at your branch has stock lines to count. A count covers consumable
                            balances; serialized assets are not counted here.
                        </Alert>
                    ) : (
                        <Autocomplete
                            options={stores}
                            value={store}
                            loading={loadingStores}
                            onChange={(_, v) => setStore(v)}
                            getOptionLabel={(s) => `${s.name}${s.branchName ? ` · ${s.branchName}` : ''}`}
                            renderOption={(props, s) => (
                                <li {...props} key={s.id}>
                                    <Box>
                                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {[s.branchName, `${s.lineCount} line${s.lineCount === 1 ? '' : 's'} to count`].filter(Boolean).join(' · ')}
                                        </Typography>
                                    </Box>
                                </li>
                            )}
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            noOptionsText="No store at your branch that you can count"
                            renderInput={(params) => (
                                <TextField {...params} size="medium" label="Store" required sx={fieldSx} />
                            )}
                        />
                    )}
                    <TextField
                        fullWidth size="medium" multiline rows={2} label="Notes"
                        value={notes} onChange={(e) => setNotes(e.target.value)}
                        helperText="Optional — e.g. month-end count"
                        sx={fieldSx}
                    />
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        This is a <strong>blind count</strong>: expected quantities are withheld until you
                        submit, so the shelf is counted rather than the number confirmed.
                    </Alert>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={saving} sx={{ textTransform: 'none' }}>Cancel</Button>
                <Button onClick={submit} disabled={saving || !store} variant="contained" disableElevation
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: `${radii.pill}px`, px: 3, bgcolor: brand[500], '&:hover': { bgcolor: brand[700] } }}>
                    {saving ? 'Opening…' : 'Open count sheet'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StockTake;

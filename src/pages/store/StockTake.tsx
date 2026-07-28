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
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    alpha,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
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

import axiosInstance from '../../core/apis/axiosInstance';
import { fetchStockAdjustmentsService, fetchStockCountsService, openStockCountService } from './service';
import { ADJUSTMENT_REASONS, IStockCount, IVarianceReport } from './stockTakeInterface';
import { ROUTES } from '../../core/routes/routes';
import { PageHero, StatTile } from '../../components/layout';
import { fieldSx } from '../../components/forms/Inputs';
import { brand, neutral, border, radii, status as statusTokens } from '../../utils/tokens';

interface IStoreOption { id: number; name: string; storeType: string }

const STATUS_TONE: Record<string, { bg: string; fg: string }> = {
    DRAFT: { bg: alpha(neutral[500], 0.12), fg: neutral[700] },
    IN_PROGRESS: { bg: statusTokens.warning.soft, fg: statusTokens.warning.strong },
    SUBMITTED: { bg: statusTokens.info.soft, fg: statusTokens.info.strong },
    APPROVED: { bg: alpha(brand[500], 0.12), fg: brand[700] },
    POSTED: { bg: statusTokens.success.soft, fg: statusTokens.success.strong },
    CANCELLED: { bg: statusTokens.danger.soft, fg: statusTokens.danger.strong },
};

/** Stock takes: open a count, follow one through, and read the variance history. */
const StockTake = () => {
    const [counts, setCounts] = useState<IStockCount[]>([]);
    const [report, setReport] = useState<IVarianceReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const navigate = useNavigate();

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

    const inFlight = counts.filter((c) => !['POSTED', 'CANCELLED'].includes(c.status)).length;

    return (
        <Box sx={{ minHeight: '100vh', px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, pb: 4 }}>
            <PageHero
                title="Stock Take"
                subtitle="Count what is on the shelf and reconcile the balances to it"
                icon={<FactCheckOutlinedIcon />}
                actions={
                    <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setOpenDialog(true)}
                        sx={{ bgcolor: brand[500], textTransform: 'none', fontWeight: 600, borderRadius: '8px', '&:hover': { bgcolor: brand[700] } }}>
                        Open a Count
                    </Button>
                }
                stat={{ value: loading ? '…' : String(counts.length), label: 'counts', helper: `${inFlight} in progress` }}
            />

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

            {!loading && counts.length === 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    No stock takes yet. Open a count to reconcile a store against what is physically on its shelves.
                </Alert>
            )}

            {!loading && counts.length > 0 && (
                <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden', mb: 3 }}>
                    <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${border.subtle}` }}>
                        <Typography sx={{ fontWeight: 700, color: neutral[900] }}>Counts</Typography>
                    </Box>
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table size="small" sx={{ minWidth: 800 }}>
                            <TableHead>
                                <TableRow sx={{ '& th': { bgcolor: alpha(brand[500], 0.04), borderBottom: `1px solid ${border.subtle}`, fontWeight: 700, fontSize: '0.67rem', color: brand[700], textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.4, whiteSpace: 'nowrap' } }}>
                                    <TableCell>Reference</TableCell>
                                    <TableCell>Store</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Lines</TableCell>
                                    <TableCell align="center">Variances</TableCell>
                                    <TableCell>Counted by</TableCell>
                                    <TableCell align="center">Open</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {counts.map((c, idx) => {
                                    const tone = STATUS_TONE[c.status] ?? STATUS_TONE.DRAFT;
                                    return (
                                        <TableRow key={c.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: alpha(neutral[900], 0.012) }, '& td': { borderBottom: `1px solid ${alpha(neutral[900], 0.05)}`, py: 1.2, fontSize: '0.83rem' } }}>
                                            <TableCell sx={{ fontWeight: 700, color: neutral[900] }}>{c.reference}</TableCell>
                                            <TableCell sx={{ color: neutral[600] }}>{c.storeName}</TableCell>
                                            <TableCell>
                                                <Chip size="small" label={c.status.replace('_', ' ')} sx={{ height: 21, fontWeight: 700, fontSize: '0.68rem', bgcolor: tone.bg, color: tone.fg }} />
                                            </TableCell>
                                            <TableCell align="center">{c.countedLines}/{c.totalLines}</TableCell>
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
                                <TableRow sx={{ '& th': { bgcolor: alpha(brand[500], 0.04), borderBottom: `1px solid ${border.subtle}`, fontWeight: 700, fontSize: '0.67rem', color: brand[700], textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.4, whiteSpace: 'nowrap' } }}>
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
                                    <TableRow key={a.id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: alpha(neutral[900], 0.012) }, '& td': { borderBottom: `1px solid ${alpha(neutral[900], 0.05)}`, py: 1.2, fontSize: '0.83rem' } }}>
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
                                            {ADJUSTMENT_REASONS.find((r) => r.value === a.reason)?.label ?? a.reason}
                                            {a.note && <Typography sx={{ fontSize: '0.7rem', color: neutral[500] }}>{a.note}</Typography>}
                                        </TableCell>
                                        <TableCell sx={{ color: neutral[500], fontSize: '0.76rem' }}>{a.countReference}</TableCell>
                                        <TableCell sx={{ color: neutral[500], fontSize: '0.76rem' }}>{moment(a.postedAt).format('DD MMM YYYY')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            <OpenCountDialog open={openDialog} onClose={() => setOpenDialog(false)} onOpened={(id) => navigate(`${ROUTES.STOCK_TAKE}/${id}`)} />
        </Box>
    );
};

const OpenCountDialog = ({ open, onClose, onOpened }: {
    open: boolean; onClose: () => void; onOpened: (id: number) => void;
}) => {
    const [stores, setStores] = useState<IStoreOption[]>([]);
    const [store, setStore] = useState<IStoreOption | null>(null);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        (async () => {
            try {
                const res = await axiosInstance.get('inventory/stores');
                setStores((res.data as IStoreOption[]) ?? []);
            } catch {
                setStores([]);
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
                    <Autocomplete
                        options={stores}
                        value={store}
                        onChange={(_, v) => setStore(v)}
                        getOptionLabel={(s) => `${s.name}${s.storeType ? ` · ${s.storeType}` : ''}`}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        renderInput={(params) => (
                            <TextField {...params} size="medium" label="Store" required sx={fieldSx} />
                        )}
                    />
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

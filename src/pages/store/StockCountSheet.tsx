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
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    InputAdornment,
    LinearProgress,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Step,
    StepLabel,
    Stepper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import {
    approveStockCountService,
    cancelStockCountService,
    fetchStockCountService,
    postStockCountService,
    saveStockCountLinesService,
    sendBackStockCountService,
    submitStockCountService,
} from './service';
import { ADJUSTMENT_REASONS, AdjustmentReason, IStockCount, IStockCountLine } from './stockTakeInterface';
import { ROUTES } from '../../core/routes/routes';
import usePermissions from '../../core/permissions/usePermissions';
import RoutesUtills from '../../core/routes/utills';
import { canCancel, canPost, canRecordCounts, canReview, isActionable, reviewBlockedAsCounter } from './stockTakeRules';
import { STOCK_TAKE_STEPS, activeStepOf, groupLines } from './stockTakeProgress';
import { fieldSx } from '../../components/forms/Inputs';
import { brand, gold, neutral, border, surface, elevation, radii, status as statusTokens } from '../../utils/tokens';

type Draft = Record<number, { counted: string; reason: AdjustmentReason | ''; note: string }>;

/** A refusal travels as 417 with `errorCode: ACCESS_DENIED`; older backends sent 422 or 403. */
const isRefusal = (error: any): boolean => {
    const status = error?.response?.status;
    return error?.response?.data?.errorCode === 'ACCESS_DENIED' || [417, 422, 403].includes(status);
};

const STATUS_TONE: Record<string, { bg: string; fg: string }> = {
    DRAFT: { bg: alpha(neutral[500], 0.12), fg: neutral[700] },
    IN_PROGRESS: { bg: statusTokens.warning.soft, fg: statusTokens.warning.strong },
    SUBMITTED: { bg: statusTokens.info.soft, fg: statusTokens.info.strong },
    APPROVED: { bg: alpha(brand[500], 0.12), fg: brand[700] },
    POSTED: { bg: statusTokens.success.soft, fg: statusTokens.success.strong },
    CANCELLED: { bg: statusTokens.danger.soft, fg: statusTokens.danger.strong },
};

/**
 * The count sheet.
 *
 * <p>While a blind count is being counted the server withholds system quantities, so those columns
 * are genuinely absent rather than merely hidden — the counter records what is on the shelf without
 * anything to anchor to. They appear once the sheet is submitted, at which point this same screen
 * becomes the variance review.
 */
const StockCountSheet = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [count, setCount] = useState<IStockCount | null>(null);
    const [draft, setDraft] = useState<Draft>({});
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    /*
     * Why the sheet is missing. A refusal used to read "Count sheet not found" — a boundary rendered
     * as a fact about the record.
     */
    const [loadError, setLoadError] = useState<string | null>(null);
    /** Which reason dialog is open: sending back, or cancelling. Both require a reason. */
    const [reasonFor, setReasonFor] = useState<'sendBack' | 'cancel' | null>(null);
    // Narrow what is shown only; every line is still saved and submitted.
    const [search, setSearch] = useState('');
    const [uncountedOnly, setUncountedOnly] = useState(false);
    const [moreAnchor, setMoreAnchor] = useState<HTMLElement | null>(null);

    const { has } = usePermissions();
    const currentUserId = (RoutesUtills().getCurrentUser() as { id?: number } | null)?.id ?? null;

    const load = useCallback(async () => {
        try {
            const res = await fetchStockCountService(id as string);
            const data = res.data as IStockCount;
            setCount(data);
            setDraft(Object.fromEntries(data.lines.map((l) => [l.commodityId, {
                counted: l.countedQuantity == null ? '' : String(l.countedQuantity),
                reason: (l.reason ?? '') as AdjustmentReason | '',
                note: l.note ?? '',
            }])));
            setLoadError(null);
        } catch (error) {
            setCount(null);
            setLoadError(isRefusal(error)
                ? 'You do not have access to this count. Stock takes are limited to stores at your branch.'
                : 'Could not load this count sheet. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const counting = count?.status === 'DRAFT' || count?.status === 'IN_PROGRESS';
    const reviewing = count?.status === 'SUBMITTED';
    const approved = count?.status === 'APPROVED';
    const terminal = count?.status === 'POSTED' || count?.status === 'CANCELLED';
    const revealed = !!count && !counting;

    const countedSoFar = useMemo(
        () => Object.values(draft).filter((d) => d.counted !== '').length,
        [draft]
    );
    const progress = count?.totalLines ? Math.round((countedSoFar / count.totalLines) * 100) : 0;

    const setField = (commodityId: number, field: 'counted' | 'reason' | 'note', value: string) =>
        setDraft((prev) => ({ ...prev, [commodityId]: { ...prev[commodityId], [field]: value } }));

    /** Runs one or more calls in order, stopping at the first failure. Returns whether all ran. */
    const run = async (steps: Array<() => Promise<any>>, success: string): Promise<boolean> => {
        setBusy(true);
        try {
            for (const step of steps) await step();
            toast.success(success);
            await load();
            return true;
        } catch {
            // The axios interceptor surfaces the server's message, which names the offending lines.
            return false;
        } finally {
            setBusy(false);
        }
    };

    const saveLines = () => saveStockCountLinesService(id as string, {
        lines: Object.entries(draft).map(([commodityId, d]) => ({
            commodityId: Number(commodityId),
            countedQuantity: d.counted === '' ? null : Number(d.counted),
            reason: d.reason || null,
            note: d.note || null,
        })),
    });

    const save = () => run([saveLines], 'Counts saved');

    // One sequence, so a failed save stops the submit instead of submitting the last saved figures.
    const submit = () => run([saveLines, () => submitStockCountService(id as string)], 'Submitted for review. The other approvers at this branch have been notified.');

    const confirmReason = async (remarks: string) => {
        const ok = reasonFor === 'sendBack'
            ? await run([() => sendBackStockCountService(id as string, remarks)], 'Sent back for recount')
            : await run([() => cancelStockCountService(id as string, remarks)], 'Count cancelled');
        if (ok) setReasonFor(null);
    };

    if (loading) {
        return <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress sx={{ color: brand[500] }} /></Stack>;
    }
    if (!count) {
        return <Box sx={{ p: 3 }}><Alert severity="error">{loadError ?? 'Count sheet not found.'}</Alert></Box>;
    }

    // What this viewer may do — the same rules the endpoints apply (see stockTakeRules).
    const mayRecord = canRecordCounts(count, has);
    const mayReview = canReview(count, has, currentUserId);
    const mayPost = canPost(count, has);
    const mayCancel = canCancel(count, has, currentUserId);
    const blockedAsCounter = reviewBlockedAsCounter(count, has, currentUserId);

    const tone = STATUS_TONE[count.status] ?? STATUS_TONE.DRAFT;
    const activeStep = activeStepOf(count.status);

    const groups = groupLines(count.lines, {
        search,
        uncountedOnly: counting && uncountedOnly,
        countedValue: (l) => draft[l.commodityId]?.counted ?? '',
    });
    const shownLines = groups.reduce((n, g) => n + g.lines.length, 0);
    const columns = revealed ? 5 : 3;
    const hasPrimaryAction = mayRecord || (reviewing && mayReview) || (approved && mayPost);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 1400, mx: 'auto', px: { xs: 1, sm: 2 }, py: 2 }}>
            {/* Header */}
            <Box sx={{ borderRadius: `${radii.lg}px`, border: `1px solid ${border.subtle}`, bgcolor: surface.card, boxShadow: elevation.card, overflow: 'hidden' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between" sx={{ px: 3, py: 2.5 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: alpha(brand[500], 0.08), border: `1px solid ${alpha(brand[500], 0.18)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FactCheckOutlinedIcon sx={{ color: brand[600] }} />
                        </Box>
                        <Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="h6" sx={{ fontWeight: 700, color: neutral[900] }}>{count.reference}</Typography>
                                <Chip size="small" label={count.status.replace('_', ' ')} sx={{ height: 22, fontWeight: 700, fontSize: '0.8rem', bgcolor: tone.bg, color: tone.fg }} />
                                {count.blind && counting && (
                                    <Tooltip arrow title="System quantities are withheld while counting, so the shelf is counted rather than the number confirmed.">
                                        <Chip size="small" icon={<VisibilityOffOutlinedIcon sx={{ fontSize: 13 }} />} label="Blind" sx={{ height: 22, fontWeight: 700, fontSize: '0.8rem', bgcolor: alpha(gold[500], 0.14), color: gold[700], '& .MuiChip-icon': { color: gold[700] } }} />
                                    </Tooltip>
                                )}
                            </Stack>
                            <Typography variant="body2" sx={{ color: neutral[500], mt: 0.25 }}>
                                {count.storeName}{count.storeBranchName ? ` · ${count.storeBranchName}` : ''}
                                {count.assetTypeName ? ` · ${count.assetTypeName}` : ''}
                                {count.countedByName ? ` · opened by ${count.countedByName}` : ''}
                                {count.approvedByName ? ` · approved by ${count.approvedByName}` : ''}
                            </Typography>
                        </Box>
                    </Stack>

                    <Button onClick={() => navigate(ROUTES.STOCK_TAKE)} startIcon={<ArrowBackIosNewOutlinedIcon sx={{ fontSize: 12 }} />}
                        sx={{ textTransform: 'none', fontWeight: 600, color: brand[700], bgcolor: alpha(brand[500], 0.06), borderRadius: `${radii.pill}px`, px: 2 }}>
                        All counts
                    </Button>
                </Stack>

                {/* Where this count is in the process. A cancelled count left it, so it has no step. */}
                {activeStep != null && (
                    <Box sx={{ px: 3, pb: 2, overflowX: 'auto' }}>
                        <Stepper activeStep={activeStep} alternativeLabel
                            sx={{ minWidth: 520, '& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed': { color: brand[500] }, '& .MuiStepLabel-label': { fontSize: '0.8rem', mt: '4px !important' } }}>
                            {STOCK_TAKE_STEPS.map((s) => (
                                <Step key={s.label}>
                                    <Tooltip arrow title={s.detail}><StepLabel>{s.label}</StepLabel></Tooltip>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                )}

                {counting && (
                    <Box sx={{ px: 3, pb: 2 }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: neutral[500] }}>
                                {countedSoFar} of {count.totalLines} lines counted
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: brand[700] }}>{progress}%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={progress} sx={{ height: 7, borderRadius: 4, bgcolor: alpha(brand[500], 0.1), '& .MuiLinearProgress-bar': { bgcolor: brand[500], borderRadius: 4 } }} />
                    </Box>
                )}
            </Box>

            {!isActionable(count) && !terminal && (
                <Alert severity="info">
                    <strong>View only.</strong> This count belongs to {count.storeBranchName || 'another branch'};
                    it is counted, approved and posted by the staff at that branch.
                </Alert>
            )}

            {count.reviewRemarks && (
                <Alert severity={count.status === 'IN_PROGRESS' ? 'warning' : 'info'} icon={<ReplayOutlinedIcon fontSize="small" />}>
                    {count.reviewRemarks}
                </Alert>
            )}

            {counting && count.blind && (
                <Alert severity="info" icon={<VisibilityOffOutlinedIcon fontSize="small" />}>
                    This is a <strong>blind count</strong> — record what is physically on the shelf. Expected
                    quantities and variances appear once you submit.
                </Alert>
            )}

            {revealed && !terminal && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <SummaryTile label="Lines" value={count.totalLines} />
                    <SummaryTile label="With variance" value={count.linesWithVariance} tone={count.linesWithVariance ? statusTokens.warning : undefined} />
                    <SummaryTile label="Net unit variance" value={count.netUnitVariance} tone={count.netUnitVariance !== 0 ? statusTokens.warning : undefined} signed />
                </Stack>
            )}

            {count.status === 'CANCELLED' && (
                <Alert severity="warning" icon={<BlockOutlinedIcon fontSize="small" />}>
                    This count was cancelled. Nothing was applied to stock.
                </Alert>
            )}

            {/* Sheet */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', overflow: 'hidden' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}
                    sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${border.subtle}` }}>
                    <TextField
                        size="small" placeholder="Search commodity or category"
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
                        sx={{ ...fieldSx, width: { xs: '100%', sm: 300 } }}
                    />
                    {counting && (
                        <FormControlLabel
                            control={<Switch size="small" checked={uncountedOnly} onChange={(e) => setUncountedOnly(e.target.checked)} />}
                            label={<Typography variant="body2" sx={{ fontWeight: 600, color: neutral[700] }}>Uncounted only</Typography>}
                        />
                    )}
                    <Typography variant="body2" sx={{ color: neutral[500], ml: { sm: 'auto !important' } }}>
                        {shownLines === count.lines.length
                            ? `${count.lines.length} line${count.lines.length === 1 ? '' : 's'}`
                            : `Showing ${shownLines} of ${count.lines.length} lines`}
                    </Typography>
                </Stack>
                <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: revealed ? 980 : 780 }}>
                        <TableHead>
                            <TableRow sx={{ '& th': { bgcolor: alpha(brand[500], 0.04), borderBottom: `1px solid ${border.subtle}`, fontWeight: 700, fontSize: '0.8rem', color: brand[700], textTransform: 'uppercase', letterSpacing: '0.05em', py: 1.4, whiteSpace: 'nowrap' } }}>
                                <TableCell>Commodity</TableCell>
                                {revealed && <TableCell align="center">System</TableCell>}
                                <TableCell align="center" sx={{ width: 130 }}>Counted</TableCell>
                                {revealed && <TableCell align="center">Variance</TableCell>}
                                <TableCell sx={{ width: 190 }}>Reason</TableCell>
                                <TableCell sx={{ width: 220 }}>Note</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {groups.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={columns} align="center" sx={{ py: 4, color: neutral[500] }}>
                                        {uncountedOnly && !search.trim() ? 'Every line has been counted.' : 'No lines match.'}
                                    </TableCell>
                                </TableRow>
                            )}
                            {groups.map((group) => [
                                <TableRow key={`group-${group.category}`}>
                                    <TableCell colSpan={columns} sx={{ bgcolor: alpha(neutral[900], 0.03), py: 0.9, fontWeight: 700, fontSize: '0.8rem', color: neutral[700], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {group.category} · {group.lines.length}
                                    </TableCell>
                                </TableRow>,
                                ...group.lines.map((line, idx) => (
                                    <LineRow
                                        key={line.commodityId}
                                        line={line}
                                        idx={idx}
                                        draft={draft[line.commodityId]}
                                        editable={mayRecord && !busy}
                                        revealed={revealed}
                                        onChange={setField}
                                    />
                                )),
                            ])}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {blockedAsCounter && (
                <Alert severity="info">
                    You opened this count, so it must be approved or sent back by another approver at
                    this branch. They have been notified.
                </Alert>
            )}

            {/*
              * Actions — only those this viewer's permissions and relationship to the count allow. The bar
              * stays on screen while a long sheet scrolls, with this stage's one main action on the right;
              * cancelling is rare and irreversible for the count, so it sits behind the menu.
              */}
            {!terminal && (hasPrimaryAction || mayCancel) && (
                <Paper elevation={0} sx={{ position: 'sticky', bottom: 0, zIndex: 2, p: 2, borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: '#fff', boxShadow: `0 -6px 18px ${alpha(neutral[900], 0.08)}` }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end" alignItems={{ sm: 'center' }}>
                        <Typography variant="body2" sx={{ color: neutral[500], mr: { sm: 'auto !important' } }}>
                            {mayRecord && `${countedSoFar} of ${count.totalLines} lines counted. Save as you go; submitting reveals the differences.`}
                            {reviewing && mayReview && 'Approve the differences, or send the sheet back for a recount.'}
                            {approved && mayPost && 'Posting is the only step that changes stock.'}
                        </Typography>
                        {mayCancel && (
                            <>
                                <IconButton aria-label="More actions" onClick={(e) => setMoreAnchor(e.currentTarget)} disabled={busy}
                                    sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                                    <MoreVertRoundedIcon />
                                </IconButton>
                                <Menu anchorEl={moreAnchor} open={!!moreAnchor} onClose={() => setMoreAnchor(null)}>
                                    <MenuItem onClick={() => { setMoreAnchor(null); setReasonFor('cancel'); }}
                                        sx={{ color: statusTokens.danger.strong, fontWeight: 600 }}>
                                        <BlockOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Cancel count
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                        {mayRecord && (
                            <>
                                <Button onClick={save} disabled={busy} startIcon={<SaveOutlinedIcon />}
                                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: `${radii.pill}px`, px: 2.5, color: neutral[700] }}>
                                    Save progress
                                </Button>
                                <Button onClick={submit} disabled={busy} variant="contained" disableElevation startIcon={<SendOutlinedIcon />}
                                    sx={primaryBtn}>
                                    Submit for review
                                </Button>
                            </>
                        )}
                        {reviewing && mayReview && (
                            <>
                                <Button onClick={() => setReasonFor('sendBack')} disabled={busy} startIcon={<UndoOutlinedIcon />}
                                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: `${radii.pill}px`, px: 2.5, color: statusTokens.warning.strong }}>
                                    Send back
                                </Button>
                                <Button onClick={() => run([() => approveStockCountService(id as string)], 'Variances approved')}
                                    disabled={busy} variant="contained" disableElevation startIcon={<CheckCircleOutlineIcon />} sx={primaryBtn}>
                                    Approve variances
                                </Button>
                            </>
                        )}
                        {approved && mayPost && (
                            <Button onClick={() => run([() => postStockCountService(id as string)], 'Adjustments posted')}
                                disabled={busy} variant="contained" disableElevation startIcon={<PublishOutlinedIcon />} sx={primaryBtn}>
                                Post adjustments
                            </Button>
                        )}
                    </Stack>
                </Paper>
            )}

            <ReasonDialog
                kind={reasonFor}
                busy={busy}
                onClose={() => setReasonFor(null)}
                onConfirm={confirmReason}
            />

            {count.status === 'POSTED' && (
                <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="small" />}>
                    Posted. {count.linesWithVariance} line(s) were adjusted and recorded in the variance report.
                </Alert>
            )}
        </Box>
    );
};

/**
 * The reason behind Send back or Cancel. Both require one on the server, so the Confirm button waits
 * for it. Replaces a browser `window.prompt`, which could not say what the reason was for.
 */
const ReasonDialog = ({ kind, busy, onClose, onConfirm }: {
    kind: 'sendBack' | 'cancel' | null;
    busy: boolean;
    onClose: () => void;
    onConfirm: (remarks: string) => void;
}) => {
    const [remarks, setRemarks] = useState('');
    useEffect(() => { if (kind) setRemarks(''); }, [kind]);

    const cancelling = kind === 'cancel';
    return (
        <Dialog open={kind !== null} onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: `${radii.xl}px` } }}>
            <DialogTitle sx={{ fontWeight: 700 }}>
                {cancelling ? 'Cancel this count' : 'Send back for recount'}
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Typography variant="body2" sx={{ color: neutral[600] }}>
                        {cancelling
                            ? 'Nothing has been applied to stock, so nothing is undone. The store becomes free for a new count.'
                            : 'The counter will see this note on the sheet and can correct the lines before submitting again.'}
                    </Typography>
                    <TextField
                        autoFocus fullWidth multiline rows={3} required
                        label={cancelling ? 'Why is it being cancelled?' : 'What needs recounting?'}
                        value={remarks} onChange={(e) => setRemarks(e.target.value)}
                        sx={fieldSx}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={busy} sx={{ textTransform: 'none' }}>Back</Button>
                <Button onClick={() => onConfirm(remarks.trim())} disabled={busy || !remarks.trim()}
                    variant="contained" disableElevation
                    sx={{ ...primaryBtn, ...(cancelling ? { background: statusTokens.danger.strong, '&:hover': { background: statusTokens.danger.strong } } : {}) }}>
                    {cancelling ? 'Cancel count' : 'Send back'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const primaryBtn = {
    textTransform: 'none' as const,
    fontWeight: 700,
    borderRadius: `${radii.pill}px`,
    px: 3,
    height: 42,
    background: `linear-gradient(135deg, ${brand[500]} 0%, ${brand[700]} 100%)`,
    boxShadow: `0 6px 16px ${alpha(brand[500], 0.3)}`,
    '&:hover': { background: `linear-gradient(135deg, ${brand[600]} 0%, ${brand[700]} 100%)` },
    '&.Mui-disabled': { background: neutral[200], color: neutral[400], boxShadow: 'none' },
};

const SummaryTile = ({ label, value, tone, signed }: {
    label: string; value: number; tone?: { soft: string; strong: string }; signed?: boolean;
}) => (
    <Box sx={{ flex: 1, p: 1.75, borderRadius: 2, border: `1px solid ${border.subtle}`, bgcolor: tone ? tone.soft : '#fff' }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: neutral[400], textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Typography>
        <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: tone ? tone.strong : neutral[900], fontVariantNumeric: 'tabular-nums' }}>
            {signed && value > 0 ? `+${value}` : value}
        </Typography>
    </Box>
);

const LineRow = ({ line, idx, draft, editable, revealed, onChange }: {
    line: IStockCountLine;
    idx: number;
    draft?: { counted: string; reason: AdjustmentReason | ''; note: string };
    editable: boolean;
    revealed: boolean;
    onChange: (commodityId: number, field: 'counted' | 'reason' | 'note', value: string) => void;
}) => {
    const counted = draft?.counted ?? '';
    const variance = revealed && line.systemQuantity != null && counted !== ''
        ? Number(counted) - line.systemQuantity
        : null;
    const needsReason = variance != null && variance !== 0;

    return (
        <TableRow sx={{
            bgcolor: line.recountRequired
                ? statusTokens.warning.soft
                : idx % 2 ? alpha(neutral[900], 0.012) : 'transparent',
            '& td': { borderBottom: `1px solid ${alpha(neutral[900], 0.05)}`, py: 1.1, fontSize: '0.875rem' },
        }}>
            <TableCell>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: neutral[900] }}>{line.commodityName}</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: neutral[500] }}>
                    {line.assetTypeName || '—'}
                    {line.recountRequired && ' · stock moved during the count — count this line again'}
                </Typography>
            </TableCell>

            {revealed && (
                <TableCell align="center" sx={{ fontVariantNumeric: 'tabular-nums', color: neutral[700] }}>
                    {line.systemQuantity ?? '—'}
                </TableCell>
            )}

            <TableCell align="center">
                {editable ? (
                    <TextField
                        size="small" type="number" placeholder="—"
                        value={counted}
                        onChange={(e) => onChange(line.commodityId, 'counted', e.target.value)}
                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                        sx={{ ...fieldSx, width: 100 }}
                    />
                ) : (
                    <Typography sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        {line.countedQuantity ?? '—'}
                    </Typography>
                )}
            </TableCell>

            {revealed && (
                <TableCell align="center">
                    {variance == null || variance === 0 ? (
                        <Typography component="span" sx={{ color: neutral[400] }}>—</Typography>
                    ) : (
                        <Chip size="small" label={variance > 0 ? `+${variance}` : variance}
                            sx={{
                                height: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                                bgcolor: variance > 0 ? statusTokens.success.soft : statusTokens.danger.soft,
                                color: variance > 0 ? statusTokens.success.strong : statusTokens.danger.strong,
                            }} />
                    )}
                </TableCell>
            )}

            <TableCell>
                {editable ? (
                    <TextField
                        select size="small" fullWidth
                        value={draft?.reason ?? ''}
                        onChange={(e) => onChange(line.commodityId, 'reason', e.target.value)}
                        error={needsReason && !draft?.reason}
                        helperText={needsReason && !draft?.reason ? 'Required for a variance' : undefined}
                        sx={fieldSx}
                    >
                        <MenuItem value=""><em>None</em></MenuItem>
                        {ADJUSTMENT_REASONS.map((r) => (
                            <MenuItem key={r.value} value={r.value}>
                                <Box>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{r.label}</Typography>
                                    <Typography sx={{ fontSize: '0.8rem', color: neutral[500] }}>{r.hint}</Typography>
                                </Box>
                            </MenuItem>
                        ))}
                    </TextField>
                ) : (
                    <Typography sx={{ color: neutral[700] }}>
                        {ADJUSTMENT_REASONS.find((r) => r.value === line.reason)?.label ?? '—'}
                    </Typography>
                )}
            </TableCell>

            <TableCell>
                {editable ? (
                    <TextField
                        size="small" fullWidth placeholder="Optional"
                        value={draft?.note ?? ''}
                        onChange={(e) => onChange(line.commodityId, 'note', e.target.value)}
                        error={draft?.reason === 'OTHER' && !draft?.note}
                        helperText={draft?.reason === 'OTHER' && !draft?.note ? 'Required for “Other”' : undefined}
                        sx={fieldSx}
                    />
                ) : (
                    <Typography sx={{ color: neutral[600], fontSize: '0.875rem' }}>{line.note || '—'}</Typography>
                )}
            </TableCell>
        </TableRow>
    );
};

export default StockCountSheet;

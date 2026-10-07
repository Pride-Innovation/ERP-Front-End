/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode, useCallback, useEffect, useState } from 'react';
import {
    alpha, Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, Stack, Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { brand, border, neutral } from '../../utils/tokens';
import {
    fetchMyLoanersService, fetchOutstandingLoanersService, makeLoanerPermanentService, returnLoanerService,
} from './service';
import { ILoaner } from './interface';
import { noApproverError } from './constants';
import NoApproverDialog from './NoApproverDialog';

interface Props {
    /**
     * `mine` — the signed-in person's own loaners, each with Return.
     * `all` — every loaner the viewer may see, with the holder named, Return and Make permanent.
     * The second needs REPAIR_ASSET, which the caller is expected to have checked.
     */
    mode: 'mine' | 'all';
    /** Called after a return or a conversion, so a parent can refresh anything it derives. */
    onChanged?: () => void;
    /** Rendered when there is nothing on loan. Null renders nothing at all. */
    emptyText?: string | null;
    /** Shown above the list, and only when there is something in it. */
    heading?: ReactNode;
}

const fmtDate = (v?: string | null) =>
    (v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

const daysSince = (v?: string | null) =>
    (v ? Math.max(0, Math.floor((Date.now() - new Date(v).getTime()) / 86_400_000)) : null);

const tag = (l: ILoaner) => `${l.engravedNumber ?? `#${l.assetId}`}${l.assetName ? ` — ${l.assetName}` : ''}`;

/**
 * Temporary replacements still out, and the two ways one ends.
 *
 * <p>A loaner is returned by hand. Returning a repaired asset used to take one back automatically,
 * which guessed which loaner when somebody held several and could collect it before their own asset
 * had even been approved to travel. Now nothing moves a loaner until somebody chooses to — the
 * holder once they have their own asset back, or a storekeeper on their behalf.
 *
 * <p>What keeps loaners from going missing is that they are visible: each says which repair it
 * covers, a loaner whose repair is back reads "Due back", and storekeepers see them oldest first.
 */
const LoanerList = ({ mode, onChanged, emptyText = 'Nothing is on loan.', heading }: Props) => {
    const [loaners, setLoaners] = useState<ILoaner[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [noApprover, setNoApprover] = useState<{ assetId: number; message: string } | null>(null);
    const [confirmPermanent, setConfirmPermanent] = useState<ILoaner | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = (await (mode === 'mine' ? fetchMyLoanersService() : fetchOutstandingLoanersService())) as any;
            // Trap #6: the service returns the error rather than throwing — anything but 200 failed.
            if (r?.status === 200) {
                setLoaners(r.data ?? []);
                setFailed(false);
            } else {
                setFailed(true);
            }
        } finally {
            setLoading(false);
        }
    }, [mode]);

    useEffect(() => { load(); }, [load]);

    const errorText = (r: any, fallback: string) =>
        r?.response?.data?.detail ?? r?.response?.data?.message ?? fallback;

    const doReturn = async (assetId: number, bypassReason?: string) => {
        setBusyId(assetId);
        try {
            const r = (await returnLoanerService(assetId,
                bypassReason ? { proceedWithoutApproval: true, bypassReason } : undefined)) as any;
            if (r?.status === 201 || r?.status === 200) {
                toast.success(bypassReason
                    ? 'Return started without approval — the exception has been recorded.'
                    : 'Return started. Hand the item to the storekeeper.');
                setNoApprover(null);
                await load();
                onChanged?.();
                return;
            }
            // A return that crosses a location is approved like any movement that travels; when
            // nobody can approve it, offer the recorded override rather than a dead end.
            const message = noApproverError(r);
            if (message) {
                setNoApprover({ assetId, message });
                return;
            }
            toast.error(errorText(r, 'Could not start the return.'));
        } finally {
            setBusyId(null);
        }
    };

    const doMakePermanent = async (loaner: ILoaner) => {
        setBusyId(loaner.assetId);
        try {
            const r = (await makeLoanerPermanentService(loaner.assetId)) as any;
            if (r?.status === 204 || r?.status === 200) {
                toast.success(`${tag(loaner)} is now permanently assigned to ${loaner.holderName ?? 'the holder'}.`);
                setConfirmPermanent(null);
                await load();
                onChanged?.();
                return;
            }
            toast.error(errorText(r, 'Could not make the loan permanent.'));
        } finally {
            setBusyId(null);
        }
    };

    if (loading && loaners.length === 0) {
        // A dashboard card should not flash a loading line for a section most people never have.
        if (emptyText === null) return null;
        return (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
                <CircularProgress size={14} />
                <Typography variant="caption" sx={{ color: neutral[500] }}>Loading temporary assets…</Typography>
            </Stack>
        );
    }
    if (failed) {
        // Unknown is not none: a refusal must not read as "nothing on loan".
        return (
            <Alert severity="warning" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.82rem' } }}
                action={<Button size="small" onClick={load}>Retry</Button>}>
                Temporary assets could not be loaded.
            </Alert>
        );
    }
    if (loaners.length === 0) {
        return emptyText ? <Typography variant="body2" sx={{ color: neutral[500], py: 1 }}>{emptyText}</Typography> : null;
    }

    return (
        <Stack spacing={1}>
            {heading}
            {loaners.map((l) => {
                const days = daysSince(l.since);
                const pending = l.pendingReturnMovementId != null;
                return (
                    <Box
                        key={l.assetId}
                        sx={{
                            p: 1.25, borderRadius: 2, border: `1px solid ${border.subtle}`,
                            bgcolor: l.coveredAssetBack && !pending ? alpha(brand[500], 0.04) : 'transparent',
                        }}
                    >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: neutral[800] }}>
                                        {tag(l)}
                                    </Typography>
                                    <Chip size="small" label="Temporary" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700 }} />
                                    {l.coveredAssetBack && !pending && (
                                        <Chip size="small" color="warning" label="Due back"
                                            sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700 }} />
                                    )}
                                    {pending && (
                                        <Chip size="small" color="info" label={`Return under way · #${l.pendingReturnMovementId}`}
                                            sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700 }} />
                                    )}
                                </Stack>
                                <Typography variant="caption" sx={{ color: neutral[500], display: 'block' }}>
                                    {l.coversAssetLabel
                                        ? <>Covering the repair of <strong>{l.coversAssetLabel}</strong>
                                            {l.coveredAssetBack ? ' — which is back' : l.coversRepairStatus === 'Pending' ? ' — still away' : ''}</>
                                        : 'Not tied to a repair'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: neutral[400], display: 'block' }}>
                                    {mode === 'all' && <>{l.holderName ?? 'Unknown holder'}{l.holderBranchName ? ` · ${l.holderBranchName}` : ''} · </>}
                                    {l.since ? `On loan since ${fmtDate(l.since)}${days != null ? ` (${days} day${days === 1 ? '' : 's'})` : ''}` : 'On loan'}
                                    {l.returnStoreName ? ` · returns to ${l.returnStoreName}` : ''}
                                </Typography>
                            </Box>
                            {!pending && (
                                <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                                    {mode === 'all' && (
                                        <Button size="small" variant="text" disabled={busyId === l.assetId}
                                            onClick={() => setConfirmPermanent(l)} sx={{ textTransform: 'none' }}>
                                            Make permanent
                                        </Button>
                                    )}
                                    <Button size="small" variant="outlined" disabled={busyId === l.assetId}
                                        onClick={() => doReturn(l.assetId)} sx={{ textTransform: 'none' }}>
                                        {busyId === l.assetId ? 'Working…' : 'Return'}
                                    </Button>
                                </Stack>
                            )}
                        </Stack>
                    </Box>
                );
            })}

            <NoApproverDialog
                open={!!noApprover}
                message={noApprover?.message}
                busy={busyId != null}
                handleClose={() => setNoApprover(null)}
                onConfirm={(reason) => (noApprover ? doReturn(noApprover.assetId, reason) : undefined)}
            />

            {/* Converting a loan is final in effect — the asset leaves the loan pool — so it is asked twice. */}
            <Dialog open={!!confirmPermanent} onClose={() => setConfirmPermanent(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontSize: '1rem', fontWeight: 700 }}>Make this loan permanent?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: neutral[700] }}>
                        <strong>{confirmPermanent && tag(confirmPermanent)}</strong> becomes an ordinary
                        assignment to <strong>{confirmPermanent?.holderName ?? 'the holder'}</strong> and is
                        no longer pool stock that can be lent out. Use this when the asset it stood in for is
                        not coming back — written off, or replaced.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmPermanent(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" disabled={busyId != null}
                        onClick={() => confirmPermanent && doMakePermanent(confirmPermanent)} sx={{ textTransform: 'none' }}>
                        Make permanent
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};

export default LoanerList;

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React from 'react';
import {
    Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { QRCodeSVG } from 'qrcode.react';
import { ROUTES } from '../../../core/routes/routes';
import { PairingState } from './useScannerPairing';

interface IScannerPairingDialogProps {
    open: boolean;
    state: PairingState;
    onClose: () => void;
    onNewCode: () => void;
    onDisconnect: () => void;
}

/** "K7Q4M2XA" -> "K7Q4-M2XA": easier to read off a screen and type. */
const formatCode = (code: string) => `${code.slice(0, 4)}-${code.slice(4)}`;

/** Re-renders once a second while a code is showing, so its expiry can be shown and acted on. */
const useNow = (active: boolean) => {
    const [now, setNow] = React.useState(() => Date.now());
    React.useEffect(() => {
        if (!active) return;
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [active]);
    return now;
};

/**
 * Pairs a handheld PDA with this browser tab: a QR code for the PDA to scan, and the same code as
 * text for typing. Once connected, every label the PDA scans arrives in this tab's search box.
 */
const ScannerPairingDialog = ({ open, state, onClose, onNewCode, onDisconnect }: IScannerPairingDialogProps) => {
    const now = useNow(open && state.phase === 'waiting');
    const scannerUrl = `${window.location.origin}${ROUTES.SCANNER}`;

    const expiresAt = state.phase === 'waiting' ? Date.parse(state.pairing.pairCodeExpiresAt) : NaN;
    const secondsLeft = Number.isNaN(expiresAt) ? null : Math.max(0, Math.round((expiresAt - now) / 1000));
    const expired = secondsLeft === 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Handheld scanner</DialogTitle>
            <DialogContent>
                {state.phase === 'starting' && (
                    <Stack alignItems="center" sx={{ py: 4 }}>
                        <CircularProgress size={28} />
                    </Stack>
                )}

                {state.phase === 'idle' && (
                    <Stack spacing={2} alignItems="center" sx={{ py: 1, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Pair a PDA with this window, and every label it scans is searched here.
                        </Typography>
                        <Button variant="contained" onClick={onNewCode}>
                            Show pairing code
                        </Button>
                    </Stack>
                )}

                {state.phase === 'waiting' && (
                    <Stack spacing={2} alignItems="center">
                        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'stretch' }}>
                            On the PDA, open <b>{scannerUrl}</b> in Chrome, then scan this code.
                        </Typography>
                        <Box
                            sx={{
                                p: 1.5,
                                bgcolor: '#fff',
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 2,
                                opacity: expired ? 0.25 : 1,
                            }}
                        >
                            <QRCodeSVG value={state.pairing.qrValue} size={200} level="M" includeMargin={false} />
                        </Box>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 800, letterSpacing: 3, fontVariantNumeric: 'tabular-nums' }}
                        >
                            {formatCode(state.pairing.pairCode)}
                        </Typography>
                        <Typography variant="caption" color={expired ? 'error' : 'text.secondary'}>
                            {expired
                                ? 'This code has expired.'
                                : `Works once. Expires in ${Math.floor((secondsLeft ?? 0) / 60)}:${String((secondsLeft ?? 0) % 60).padStart(2, '0')}.`}
                        </Typography>
                        {expired && (
                            <Button variant="contained" onClick={onNewCode}>
                                Show a new code
                            </Button>
                        )}
                    </Stack>
                )}

                {state.phase === 'connected' && (
                    <Stack spacing={1.5} alignItems="center" sx={{ py: 2, textAlign: 'center' }}>
                        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 48 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Scanner connected
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Every label the PDA scans is searched here. If a form field is selected, the
                            scan goes into that field instead.
                        </Typography>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                {state.phase === 'connected' && (
                    <Button color="error" onClick={onDisconnect}>
                        Disconnect
                    </Button>
                )}
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ScannerPairingDialog;

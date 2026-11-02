/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { refusal } from '../../core/apis/globalService';
import {
    IScannerConnected,
    PAIR_PREFIX,
    connectScannerService,
    disconnectScannerService,
    isPairingEnded,
    sendScanService,
} from '../../components/appBar/scanRelay/service';

/** Per tab on the PDA: closing the tab ends its side of the pairing. */
const STORAGE_KEY = 'scanner-relay';

type Outcome = 'sent' | 'not-listening' | 'failed';

interface IScanLine {
    id: number;
    code: string;
    at: Date;
    outcome: Outcome;
    note?: string;
}

const readStored = (): IScannerConnected | null => {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const stored: IScannerConnected = JSON.parse(raw);
        return Date.parse(stored.expiresAt) > Date.now() ? stored : null;
    } catch {
        return null;
    }
};

const store = (value: IScannerConnected | null) => {
    try {
        if (value) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // Blocked storage: the pairing lasts until the page is reloaded.
    }
};

/** An 8-character code typed as shown on the computer - with or without its dash. */
const looksLikeTypedPairCode = (value: string) => /^[A-Za-z0-9]{4}-?[A-Za-z0-9]{4}$/.test(value);

/**
 * The PDA's page: pair with a computer, then send it every label scanned.
 *
 * <h2>How the scans arrive here</h2>
 * The PDA's scan engine types into whatever field has focus, ending with Enter. So this page keeps
 * one input focused at all times and treats each Enter as one scan. `inputMode="none"` keeps
 * Android's on-screen keyboard from covering the page every time the field is refocused; "Type a
 * code" turns it back on for entering the pairing code by hand.
 *
 * <h2>Not signed in, deliberately</h2>
 * The PDA is often shared. Scanning the code on the computer's screen buys a token that can do one
 * thing - put text into that computer's search box - and the search itself runs on the computer,
 * under the computer user's login and scope.
 */
const ScannerPage = () => {
    const [relay, setRelay] = React.useState<IScannerConnected | null>(readStored);
    const [value, setValue] = React.useState('');
    const [busy, setBusy] = React.useState(false);
    const [notice, setNotice] = React.useState<{ tone: 'error' | 'info'; text: string } | null>(null);
    const [lines, setLines] = React.useState<IScanLine[]>([]);
    const [typing, setTyping] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const nextId = React.useRef(1);

    const refocus = React.useCallback(() => {
        window.setTimeout(() => inputRef.current?.focus(), 0);
    }, []);

    React.useEffect(() => {
        refocus();
    }, [refocus, relay]);

    const pair = async (code: string) => {
        setBusy(true);
        setNotice(null);
        try {
            const connected = await connectScannerService(code);
            store(connected);
            setRelay(connected);
            setLines([]);
            setTyping(false);
        } catch (error) {
            setNotice({ tone: 'error', text: refusal(error, 'Could not pair. Check the connection and try again.') });
        } finally {
            setBusy(false);
        }
    };

    const send = async (code: string) => {
        if (!relay) return;
        const id = nextId.current++;
        const line: IScanLine = { id, code, at: new Date(), outcome: 'sent' };
        try {
            const { delivered } = await sendScanService(relay.relayToken, code);
            line.outcome = delivered ? 'sent' : 'not-listening';
            if (!delivered) line.note = 'The computer is not connected. Keep the app open there.';
        } catch (error) {
            if (isPairingEnded(error)) {
                store(null);
                setRelay(null);
                setNotice({ tone: 'info', text: 'This scanner was disconnected. Pair it again from the computer.' });
                return;
            }
            line.outcome = 'failed';
            line.note = refusal(error, 'Not sent. Check the connection and scan again.');
        }
        setLines((previous) => [line, ...previous].slice(0, 8));
    };

    const handle = async (raw: string) => {
        // eslint-disable-next-line no-control-regex
        const scanned = raw.replace(/[\u0000-\u001F\u007F]/g, '').trim();
        if (!scanned || busy) return;

        // A pairing code is recognised whether or not this scanner is already paired: scanning a
        // new one moves the scanner to that computer.
        if (scanned.toUpperCase().startsWith(PAIR_PREFIX) || (!relay && looksLikeTypedPairCode(scanned))) {
            await pair(scanned);
            return;
        }
        if (!relay) {
            setNotice({ tone: 'info', text: 'Not paired yet. Scan the pairing code shown on the computer first.' });
            return;
        }
        await send(scanned);
    };

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const current = value;
        setValue('');
        void handle(current);
        refocus();
    };

    const unpair = () => {
        // Tell the server, so the computer's scanner button stops showing a connection. Best effort:
        // if this fails, the pairing still ends on its own after eight hours.
        if (relay) void disconnectScannerService(relay.relayToken).catch(() => undefined);
        store(null);
        setRelay(null);
        setLines([]);
        setNotice(null);
    };

    return (
        <Box
            sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
            onClick={() => { if (!typing) refocus(); }}
        >
            <Stack direction="row" alignItems="center" spacing={1.5}>
                <QrCodeScannerIcon color="primary" sx={{ fontSize: 32 }} />
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                        Asset scanner
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {relay ? `Paired with ${relay.ownerName}'s computer` : 'Not paired'}
                    </Typography>
                </Box>
            </Stack>

            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    border: 2,
                    borderStyle: 'dashed',
                    borderColor: relay ? 'success.main' : 'primary.main',
                    borderRadius: 3,
                    textAlign: 'center',
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {busy ? 'Pairing…' : relay ? 'Ready. Scan a label.' : 'Scan the pairing code'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {relay
                        ? 'Each label you scan is searched on the computer.'
                        : 'On the computer, click the scanner button beside the search box and scan the code it shows.'}
                </Typography>
                <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
                    <TextField
                        inputRef={inputRef}
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        onBlur={() => { if (!typing) refocus(); }}
                        placeholder={typing ? 'Type the code, then Enter' : 'Waiting for a scan…'}
                        fullWidth
                        size="small"
                        autoComplete="off"
                        inputProps={{
                            inputMode: typing ? 'text' : 'none',
                            autoCapitalize: 'characters',
                            spellCheck: false,
                            'aria-label': 'scanned code',
                        }}
                    />
                </Box>
                {!relay && (
                    <Button size="small" sx={{ mt: 1 }} onClick={() => { setTyping((t) => !t); refocus(); }}>
                        {typing ? 'Use the scanner' : 'Type the code instead'}
                    </Button>
                )}
            </Paper>

            {notice && (
                <Typography
                    variant="body2"
                    sx={{ color: notice.tone === 'error' ? 'error.main' : 'text.secondary', textAlign: 'center' }}
                >
                    {notice.text}
                </Typography>
            )}

            {lines.length > 0 && (
                <Stack spacing={1}>
                    {lines.map((line) => (
                        <Paper key={line.id} elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                {line.outcome === 'sent' && <CheckCircleIcon color="success" />}
                                {line.outcome === 'not-listening' && <WarningAmberIcon color="warning" />}
                                {line.outcome === 'failed' && <ErrorOutlineIcon color="error" />}
                                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>
                                        {line.code}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {line.outcome === 'sent' ? 'Sent to the computer' : line.note}
                                        {' · '}
                                        {line.at.toLocaleTimeString()}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}

            {relay && (
                <Button color="inherit" startIcon={<LinkOffIcon />} onClick={unpair} sx={{ alignSelf: 'center', mt: 'auto' }}>
                    Unpair this scanner
                </Button>
            )}
        </Box>
    );
};

export default ScannerPage;

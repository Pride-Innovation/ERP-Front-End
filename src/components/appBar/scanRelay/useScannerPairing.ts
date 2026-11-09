/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React from 'react';
import { toast } from 'react-toastify';
import RoutesUtills from '../../../core/routes/utills';
import { refusal } from '../../../core/apis/globalService';
import { useWebSocket } from '../../../hooks/useWebSocket';
import {
    IPairingStarted,
    IScanRelayMessage,
    endPairingService,
    isPairingEnded,
    pairingStatusService,
    startPairingService,
} from './service';

/** Per tab: a pairing belongs to the browser tab that showed the code, and survives its reloads. */
const STORAGE_KEY = 'scanner-pairing';

export type PairingState =
    | { phase: 'idle' }
    | { phase: 'starting' }
    | { phase: 'waiting'; pairing: IPairingStarted }
    | { phase: 'connected'; pairingId: string };

const readStored = (): string | null => {
    try {
        return sessionStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
};

const store = (pairingId: string | null) => {
    try {
        if (pairingId) sessionStorage.setItem(STORAGE_KEY, pairingId);
        else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // Storage blocked: the pairing still works until the page is reloaded.
    }
};

/**
 * This browser tab's pairing with a handheld scanner, and the scans it relays.
 *
 * Listens on `/user/queue/scans` only while a pairing exists, so a user who never pairs opens no
 * second connection. Every message names its pairing, and anything for another pairing - the same
 * user's other tab, say - is ignored, so a scan lands in exactly one tab.
 *
 * @param onScan called with each code the PDA scans
 */
export const useScannerPairing = (onScan: (code: string) => void) => {
    const { getCurrentUser } = RoutesUtills();
    const userId = getCurrentUser()?.id;

    const [state, setState] = React.useState<PairingState>({ phase: 'idle' });
    const pairingId = state.phase === 'waiting' ? state.pairing.pairingId
        : state.phase === 'connected' ? state.pairingId : null;

    // The latest callback, so a re-render does not reconnect the socket.
    const latestOnScan = React.useRef(onScan);
    latestOnScan.current = onScan;
    const currentId = React.useRef<string | null>(null);
    currentId.current = pairingId;

    /** The socket and the status poll can both report the connection; say it once. */
    const announced = React.useRef<string | null>(null);
    const markConnected = React.useCallback((id: string) => {
        setState({ phase: 'connected', pairingId: id });
        if (announced.current === id) return;
        announced.current = id;
        toast.success('Scanner connected. Scans will appear in the search box.');
    }, []);

    // After a reload: ask whether the stored pairing is still alive and connected.
    React.useEffect(() => {
        const stored = readStored();
        if (!stored || !userId) return;
        let cancelled = false;
        pairingStatusService(stored)
            .then((status) => {
                if (cancelled) return;
                if (status.connected) {
                    announced.current = stored; // reconnecting after a reload is not news
                    setState({ phase: 'connected', pairingId: stored });
                } else {
                    store(null);
                } // an unscanned code from before the reload: start afresh
            })
            .catch(() => {
                if (!cancelled) store(null);
            });
        return () => { cancelled = true; };
    }, [userId]);

    const onMessage = React.useCallback((body: string) => {
        let message: IScanRelayMessage;
        try {
            message = JSON.parse(body);
        } catch {
            return;
        }
        if (!message?.pairingId || message.pairingId !== currentId.current) return;

        if (message.type === 'CONNECTED') {
            markConnected(message.pairingId);
        } else if (message.type === 'SCAN' && message.code) {
            latestOnScan.current(message.code);
        } else if (message.type === 'ENDED') {
            store(null);
            setState({ phase: 'idle' });
        }
    }, [markConnected]);

    useWebSocket({ userId, onMessage, enabled: !!userId && !!pairingId, destination: '/user/queue/scans' });

    /*
     * While the code is on screen, also ask every few seconds. The socket opens when the code is
     * shown, and a PDA quick enough to connect before the subscription lands would otherwise leave
     * this tab waiting for a "connected" message that was sent to nobody. Stops once connected.
     */
    const waitingId = state.phase === 'waiting' ? state.pairing.pairingId : null;
    React.useEffect(() => {
        if (!waitingId) return;
        const timer = window.setInterval(() => {
            pairingStatusService(waitingId)
                .then((status) => {
                    if (status.connected && currentId.current === waitingId) markConnected(waitingId);
                })
                .catch((error) => {
                    // The code expired unscanned: stop asking, and let the dialog offer a new one.
                    if (isPairingEnded(error) && currentId.current === waitingId) {
                        store(null);
                        setState({ phase: 'idle' });
                    }
                });
        }, 3000);
        return () => window.clearInterval(timer);
    }, [waitingId, markConnected]);

    const start = React.useCallback(async () => {
        setState({ phase: 'starting' });
        try {
            const pairing = await startPairingService();
            store(pairing.pairingId);
            setState({ phase: 'waiting', pairing });
        } catch (error) {
            setState({ phase: 'idle' });
            toast.error(refusal(error, 'Could not start pairing a scanner. Please try again.'));
        }
    }, []);

    const disconnect = React.useCallback(async () => {
        const id = currentId.current;
        store(null);
        setState({ phase: 'idle' });
        if (!id) return;
        try {
            await endPairingService(id);
        } catch (error) {
            // Already over on the server is the outcome asked for.
            if (!isPairingEnded(error)) {
                toast.warning('The scanner was disconnected here, but the server could not be told.');
            }
        }
    }, []);

    return { state, start, disconnect };
};

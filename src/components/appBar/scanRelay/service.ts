/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from '../../../core/apis/axiosInstance';

/**
 * The scan relay: a handheld PDA scans labels, the server passes each scan to the computer browser
 * that showed the pairing code. See the backend's `ScanRelayService`.
 *
 * All of these throw on failure (they do not return the error - trap #6), so callers can tell a
 * refusal from a result. A finished pairing arrives as a 404 carrying `errorCode: PAIRING_ENDED`,
 * which the axios interceptor leaves to the caller rather than toasting.
 */

export const PAIRING_ENDED = 'PAIRING_ENDED';
export const INVALID_SCAN = 'INVALID_SCAN';

/** The prefix the computer's QR code carries, so the PDA page tells it from an asset label. */
export const PAIR_PREFIX = 'ERPPAIR:';

/** What the computer's browser receives on `/user/queue/scans`. */
export interface IScanRelayMessage {
    type: 'CONNECTED' | 'SCAN' | 'ENDED';
    pairingId: string;
    code: string | null;
}

export interface IPairingStarted {
    pairingId: string;
    pairCode: string;
    qrValue: string;
    pairCodeExpiresAt: string;
}

export interface IPairingStatus {
    connected: boolean;
    expiresAt: string;
}

export interface IScannerConnected {
    relayToken: string;
    ownerName: string;
    expiresAt: string;
}

/** True when the error says the pairing is unknown or over. */
export const isPairingEnded = (error: any): boolean =>
    error?.response?.data?.errorCode === PAIRING_ENDED;

// ── the computer (signed in) ─────────────────────────────────────────────────

export const startPairingService = async (): Promise<IPairingStarted> =>
    (await axiosInstance.post<IPairingStarted>('scan-pairings')).data;

export const pairingStatusService = async (pairingId: string): Promise<IPairingStatus> =>
    (await axiosInstance.get<IPairingStatus>(`scan-pairings/${encodeURIComponent(pairingId)}`)).data;

export const endPairingService = async (pairingId: string): Promise<void> => {
    await axiosInstance.delete(`scan-pairings/${encodeURIComponent(pairingId)}`);
};

// ── the PDA (not signed in) ──────────────────────────────────────────────────

export const connectScannerService = async (code: string): Promise<IScannerConnected> =>
    (await axiosInstance.post<IScannerConnected>('scan-relay/connect', { code })).data;

export const disconnectScannerService = async (token: string): Promise<void> => {
    await axiosInstance.post('scan-relay/disconnect', { token });
};

export const sendScanService = async (token: string, code: string): Promise<{ delivered: boolean }> =>
    (await axiosInstance.post<{ delivered: boolean }>('scan-relay/scans', { token, code })).data;

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { StatusTone } from '../../components/layout/StatusChip';
import { statusConfig, statusTone as movementStatusTone } from '../movement/constants';

/**
 * Status colours and vocabularies for the reports page.
 *
 * <h2>Keyed on the code, never the display name</h2>
 * The chip used to look up `name.toLowerCase()` in a map of single words, so "Asset Assigned",
 * "Stock Pending" and "Request Rejected" matched nothing and every chip rendered grey. Its few
 * camelCase keys (`stockPending`, `inStore`) could never match either — they were compared after
 * lowercasing. Display names are renamed in Settings; the code (`StatusSeeder`) is what is stable.
 *
 * <p>The tones say what the reader should do with a row:
 * green = finished or in use, amber = waiting on someone, blue = in store or on the move,
 * gold = away or on loan, red = ended badly or leaving the estate.
 */
const TONES: Record<string, StatusTone> = {
    // Finished / in use
    assetAssigned: 'success',
    receiptAcknowledged: 'success',
    stockCompleted: 'success',
    Completed: 'success', // Repair.status

    // Waiting on someone
    requestCreated: 'pending',
    requestApproved: 'pending', // a tier approved; the workflow has not finished
    managerApproved: 'pending',
    hodApproved: 'pending',
    bomApproved: 'pending',
    branchManagerApproved: 'pending',
    supervisorApproved: 'pending',
    unitAcknowledged: 'pending',
    requireUpdate: 'pending',
    stockPending: 'pending',
    Pending: 'pending', // Repair.status

    // In store, or on its way
    issuanceAvailable: 'info',
    sentToStore: 'info',
    inTransit: 'info',
    issued: 'info',
    assetIssued: 'info',
    issuanceApproved: 'info',

    // Away, or lent out
    inMaintenance: 'gold',
    loanAvailable: 'gold',
    stockClosedShort: 'gold',

    // Ended badly / leaving the estate
    requestRejected: 'danger',
    pendingDisposal: 'danger',
};

/**
 * The tone for a status code. Movement codes defer to the movement pages' own rule, so a movement
 * reads the same colour here as in its register.
 */
export const reportStatusTone = (code?: string | null): StatusTone => {
    if (!code) return 'neutral';
    if (code in statusConfig) return movementStatusTone(code);
    return TONES[code] ?? 'neutral';
};

/*
 * Which statuses each report's subject can hold.
 *
 * The status catalogue mixes three vocabularies — requests, assets and stock orders — and the Status
 * dropdown offered all of them on every tab. Choosing "Request Rejected" on the asset register
 * matched nothing and the empty table read as "there are none of those".
 */
export const ASSET_STATUS_CODES = [
    'assetAssigned', 'issued', 'assetIssued', 'issuanceAvailable', 'loanAvailable', 'sentToStore',
    'inTransit', 'inMaintenance', 'requireUpdate', 'pendingDisposal',
];

export const REQUEST_STATUS_CODES = [
    'requestCreated', 'requestApproved', 'managerApproved', 'hodApproved', 'bomApproved',
    'branchManagerApproved', 'supervisorApproved', 'unitAcknowledged', 'issued', 'issuanceApproved',
    'receiptAcknowledged', 'requestRejected',
];

export const STOCK_STATUS_CODES = ['stockPending', 'stockCompleted', 'stockClosedShort'];

/** A request's two terminal states. Everything else is still moving through the workflow. */
export const REQUEST_DONE_CODE = 'receiptAcknowledged';
export const REQUEST_REJECTED_CODE = 'requestRejected';

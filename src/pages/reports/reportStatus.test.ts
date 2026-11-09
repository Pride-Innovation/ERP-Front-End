/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    ASSET_STATUS_CODES, REQUEST_STATUS_CODES, STOCK_STATUS_CODES, reportStatusTone,
} from './reportStatus';
import { statusConfig, statusTone } from '../movement/constants';

/**
 * Every code `StatusSeeder` creates, written out by hand. Deriving it from the map under test would
 * agree with the map by construction; a status added to the seeder without a colour should fail here.
 */
const SEEDED_CODES = [
    'requestCreated', 'requestRejected', 'requestApproved', 'issuanceApproved', 'issuanceAvailable',
    'issued', 'inMaintenance', 'receiptAcknowledged', 'assetAssigned', 'requireUpdate', 'stockPending',
    'stockCompleted', 'stockClosedShort', 'sentToStore', 'managerApproved', 'hodApproved', 'bomApproved',
    'branchManagerApproved', 'supervisorApproved', 'unitAcknowledged', 'pendingDisposal', 'inTransit',
    'assetIssued', 'loanAvailable',
];

describe('report status colours', () => {
    it.each(SEEDED_CODES)('%s has a colour of its own', (code) => {
        expect(reportStatusTone(code)).not.toBe('neutral');
    });

    it('decides by code, not display name — the fault that left every chip grey', () => {
        expect(reportStatusTone('assetAssigned')).toBe('success');
        expect(reportStatusTone('Asset Assigned')).toBe('neutral');
    });

    it('treats the intermediate approval tiers as waiting, not finished', () => {
        ['requestApproved', 'managerApproved', 'hodApproved', 'branchManagerApproved'].forEach((c) =>
            expect(reportStatusTone(c)).toBe('pending'));
        expect(reportStatusTone('receiptAcknowledged')).toBe('success');
    });

    it('colours a movement exactly as the movement register does', () => {
        Object.keys(statusConfig).forEach((code) =>
            expect(reportStatusTone(code)).toBe(statusTone(code)));
    });

    it('covers repairs', () => {
        expect(reportStatusTone('Pending')).toBe('pending');
        expect(reportStatusTone('Completed')).toBe('success');
    });
});

describe('per-report status vocabularies', () => {
    it.each(SEEDED_CODES)('%s is offered by at least one report', (code) => {
        expect([...ASSET_STATUS_CODES, ...REQUEST_STATUS_CODES, ...STOCK_STATUS_CODES]).toContain(code);
    });

    it('does not offer request or stock states on the asset register', () => {
        expect(ASSET_STATUS_CODES).not.toContain('requestRejected');
        expect(ASSET_STATUS_CODES).not.toContain('stockPending');
        expect(REQUEST_STATUS_CODES).not.toContain('inMaintenance');
    });
});

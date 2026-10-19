/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { PERMISSIONS, PermissionName } from '../../core/permissions/constants';
import {
    canCancel, canOpenCount, canPost, canRecordCounts, canReview, countableStores, reviewBlockedAsCounter,
} from './stockTakeRules';
import { StockCountStatus } from './stockTakeInterface';

/**
 * The stock-take buttons mirror StockTakeController / StockTakeService. Each case is a button the
 * pages used to offer to everybody who could open them.
 */

const holding = (...granted: PermissionName[]) => (p: PermissionName) => granted.includes(p);
const reader = holding(PERMISSIONS.READ_STOCK_TAKE);
const counter = holding(PERMISSIONS.READ_STOCK_TAKE, PERMISSIONS.PERFORM_STOCK_TAKE);
const approver = holding(PERMISSIONS.READ_STOCK_TAKE, PERMISSIONS.APPROVE_STOCK_TAKE);
const both = holding(PERMISSIONS.READ_STOCK_TAKE, PERMISSIONS.PERFORM_STOCK_TAKE, PERMISSIONS.APPROVE_STOCK_TAKE);

const COUNTER_ID = 7;
const OTHER_ID = 9;
const count = (status: StockCountStatus) => ({ status, countedById: COUNTER_ID });

describe('a reader holding only READ_STOCK_TAKE', () => {
    it('is offered nothing that writes', () => {
        expect(canOpenCount(reader)).toBe(false);
        expect(canRecordCounts(count('IN_PROGRESS'), reader)).toBe(false);
        expect(canReview(count('SUBMITTED'), reader, OTHER_ID)).toBe(false);
        expect(canPost(count('APPROVED'), reader)).toBe(false);
        expect(canCancel(count('DRAFT'), reader, COUNTER_ID)).toBe(false);
    });
});

describe('counting', () => {
    it('needs PERFORM_STOCK_TAKE, and only while the sheet is being counted', () => {
        expect(canOpenCount(counter)).toBe(true);
        expect(canRecordCounts(count('DRAFT'), counter)).toBe(true);
        expect(canRecordCounts(count('IN_PROGRESS'), counter)).toBe(true);
        expect(canRecordCounts(count('SUBMITTED'), counter)).toBe(false);
        expect(canRecordCounts(count('IN_PROGRESS'), approver)).toBe(false);
    });
});

describe('review', () => {
    it('needs APPROVE_STOCK_TAKE and a submitted sheet', () => {
        expect(canReview(count('SUBMITTED'), approver, OTHER_ID)).toBe(true);
        expect(canReview(count('IN_PROGRESS'), approver, OTHER_ID)).toBe(false);
        expect(canReview(count('SUBMITTED'), counter, OTHER_ID)).toBe(false);
    });

    it('is never offered to whoever counted the sheet — the server refuses it', () => {
        expect(canReview(count('SUBMITTED'), both, COUNTER_ID)).toBe(false);
        expect(reviewBlockedAsCounter(count('SUBMITTED'), both, COUNTER_ID)).toBe(true);
        // Ids arrive as strings in places; '7' and 7 are the same person.
        expect(canReview({ status: 'SUBMITTED', countedById: '7' as any }, both, COUNTER_ID)).toBe(false);
    });

    it('posting needs APPROVE_STOCK_TAKE and an approved sheet', () => {
        expect(canPost(count('APPROVED'), approver)).toBe(true);
        expect(canPost(count('SUBMITTED'), approver)).toBe(false);
        expect(canPost(count('APPROVED'), counter)).toBe(false);
    });
});

describe('cancel', () => {
    it('an approver may cancel anything not yet posted', () => {
        (['DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED'] as StockCountStatus[]).forEach((s) =>
            expect(canCancel(count(s), approver, OTHER_ID)).toBe(true));
        expect(canCancel(count('POSTED'), approver, OTHER_ID)).toBe(false);
        expect(canCancel(count('CANCELLED'), approver, OTHER_ID)).toBe(false);
    });

    it('a counter may cancel only their own count, and only while it is being counted', () => {
        expect(canCancel(count('DRAFT'), counter, COUNTER_ID)).toBe(true);
        expect(canCancel(count('IN_PROGRESS'), counter, COUNTER_ID)).toBe(true);
        expect(canCancel(count('SUBMITTED'), counter, COUNTER_ID)).toBe(false);
        expect(canCancel(count('IN_PROGRESS'), counter, OTHER_ID)).toBe(false);
    });
});

describe('the Open dialog store list', () => {
    const stores = [
        { id: 1, name: 'Gulu Admin', storeType: 'ADMIN', locationId: 10 },
        { id: 2, name: 'Mbarara Admin', storeType: 'ADMIN', locationId: 20 },
        { id: 3, name: 'IT Store', storeType: 'IT', locationId: 1 },
        { id: 4, name: 'Safe Boda', storeType: 'COURIER', locationId: 10 },
    ];

    it('offers only stores the viewer may count, and never a courier', () => {
        const atGulu = (loc: number | null | undefined) => loc === 10;
        expect(countableStores(stores, atGulu).map((s) => s.id)).toEqual([1]);

        const everywhere = () => true;
        expect(countableStores(stores, everywhere).map((s) => s.id)).toEqual([1, 2, 3]);
    });
});

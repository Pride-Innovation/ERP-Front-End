/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { PERMISSIONS, PermissionName } from '../../core/permissions/constants';
import { IStockCount, IStockCountLine, StockCountStatus } from './stockTakeInterface';
import { activeStepOf, defaultTab, groupLines, inTab, needsMyAction, nextStep } from './stockTakeProgress';

const holding = (...granted: PermissionName[]) => (p: PermissionName) => granted.includes(p);
const counter = holding(PERMISSIONS.READ_STOCK_TAKE, PERMISSIONS.PERFORM_STOCK_TAKE);
const approver = holding(PERMISSIONS.READ_STOCK_TAKE, PERMISSIONS.APPROVE_STOCK_TAKE);
const both = holding(PERMISSIONS.READ_STOCK_TAKE, PERMISSIONS.PERFORM_STOCK_TAKE, PERMISSIONS.APPROVE_STOCK_TAKE);
const reader = holding(PERMISSIONS.READ_STOCK_TAKE);

const COUNTER_ID = 7;
const OTHER_ID = 9;

const count = (status: StockCountStatus, extra: Partial<IStockCount> = {}): IStockCount => ({
    id: 1, reference: 'SC-1', storeId: 1, storeName: 'Gulu Admin Store', status, blind: true,
    countedById: COUNTER_ID, countedByName: 'Jane Okello',
    totalLines: 40, countedLines: 12, linesWithVariance: 0, netUnitVariance: 0, readyToSubmit: false,
    lines: [], ...extra,
});

describe('needs my action', () => {
    it('is the counts whose buttons this viewer is offered', () => {
        expect(needsMyAction(count('IN_PROGRESS'), counter, OTHER_ID)).toBe(true);
        expect(needsMyAction(count('SUBMITTED'), approver, OTHER_ID)).toBe(true);
        expect(needsMyAction(count('APPROVED'), approver, OTHER_ID)).toBe(true);
        expect(needsMyAction(count('SUBMITTED'), counter, OTHER_ID)).toBe(false);
        expect(needsMyAction(count('POSTED'), both, OTHER_ID)).toBe(false);
    });

    it('leaves out a count the viewer counted and so cannot approve', () => {
        expect(needsMyAction(count('SUBMITTED'), both, COUNTER_ID)).toBe(false);
    });

    it('leaves out another branch, however much the viewer holds', () => {
        expect(needsMyAction(count('SUBMITTED', { actionable: false }), both, OTHER_ID)).toBe(false);
    });

    it('does not count cancelling, which an approver may do to almost anything', () => {
        expect(needsMyAction(count('IN_PROGRESS'), approver, OTHER_ID)).toBe(false);
    });
});

describe('tabs', () => {
    it('partition into in progress and completed', () => {
        const all: StockCountStatus[] = ['DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'POSTED', 'CANCELLED'];
        all.forEach((s) => {
            const c = count(s);
            expect(inTab(c, 'progress', both, OTHER_ID)).not.toBe(inTab(c, 'completed', both, OTHER_ID));
            expect(inTab(c, 'all', both, OTHER_ID)).toBe(true);
        });
    });

    it('opens on your work when there is some, else what is open, else everything', () => {
        expect(defaultTab([count('SUBMITTED')], approver, OTHER_ID)).toBe('mine');
        expect(defaultTab([count('SUBMITTED')], reader, OTHER_ID)).toBe('progress');
        expect(defaultTab([count('POSTED')], both, OTHER_ID)).toBe('all');
        expect(defaultTab([], both, OTHER_ID)).toBe('all');
    });
});

describe('next step', () => {
    it('says how far the counting has got, and whether a recount was asked for', () => {
        expect(nextStep(count('IN_PROGRESS'), counter, OTHER_ID)).toEqual({ label: 'Counting: 12 of 40 lines', mine: true });
        expect(nextStep(count('IN_PROGRESS', { reviewRemarks: 'Recount pens' }), reader, OTHER_ID))
            .toEqual({ label: 'Sent back for recount: 12 of 40 lines', mine: false });
    });

    it('names who may not approve', () => {
        expect(nextStep(count('SUBMITTED'), approver, OTHER_ID)).toEqual({ label: 'Ready for your approval', mine: true });
        expect(nextStep(count('SUBMITTED'), both, COUNTER_ID).label).toBe('Waiting for approval by someone other than you');
        expect(nextStep(count('SUBMITTED'), reader, OTHER_ID).label).toBe('Waiting for approval (not by Jane Okello, who opened it)');
    });

    it('is never "yours" at another branch', () => {
        expect(nextStep(count('APPROVED', { actionable: false }), both, OTHER_ID))
            .toEqual({ label: 'Approved, waiting to be posted', mine: false });
    });

    it('marks the step on the progress indicator', () => {
        expect(activeStepOf('DRAFT')).toBe(1);
        expect(activeStepOf('SUBMITTED')).toBe(3);
        expect(activeStepOf('APPROVED')).toBe(4);
        expect(activeStepOf('POSTED')).toBe(5);
        expect(activeStepOf('CANCELLED')).toBeNull();
    });
});

describe('the sheet lines', () => {
    const line = (commodityId: number, commodityName: string, assetTypeName: string | null, countedQuantity: number | null = null): IStockCountLine =>
        ({ lineId: commodityId, commodityId, commodityName, assetTypeName, countedQuantity, recountRequired: false });
    const lines = [
        line(1, 'Pens', 'Stationery', 5),
        line(2, 'Bleach', 'Cleaning & Hygiene'),
        line(3, 'A4 paper', 'Stationery'),
        line(4, 'Mystery box', null),
    ];
    const saved = (l: IStockCountLine) => (l.countedQuantity == null ? '' : String(l.countedQuantity));

    it('groups by category, both sorted by name', () => {
        const groups = groupLines(lines, { search: '', uncountedOnly: false, countedValue: saved });
        expect(groups.map((g) => g.category)).toEqual(['Cleaning & Hygiene', 'Stationery', 'Uncategorised']);
        expect(groups[1].lines.map((l) => l.commodityName)).toEqual(['A4 paper', 'Pens']);
    });

    it('narrows by search on the commodity or its category', () => {
        expect(groupLines(lines, { search: 'pen', uncountedOnly: false, countedValue: saved })
            .flatMap((g) => g.lines.map((l) => l.commodityId))).toEqual([1]);
        expect(groupLines(lines, { search: 'cleaning', uncountedOnly: false, countedValue: saved })
            .flatMap((g) => g.lines.map((l) => l.commodityId))).toEqual([2]);
    });

    it('"uncounted only" reads what has been typed, not only what was saved', () => {
        const typed = (l: IStockCountLine) => (l.commodityId === 3 ? '10' : saved(l));
        expect(groupLines(lines, { search: '', uncountedOnly: true, countedValue: typed })
            .flatMap((g) => g.lines.map((l) => l.commodityId)).sort()).toEqual([2, 4]);
    });
});

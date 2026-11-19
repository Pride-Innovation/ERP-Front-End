/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    EMPTY_ADJUSTMENT_FILTERS, buildAdjustmentExportRows, describeAdjustmentFilters, toAdjustmentParams,
} from './stockAdjustments';

describe('adjustment history parameters', () => {
    it('sends only paging when nothing is filtered', () => {
        expect(toAdjustmentParams(EMPTY_ADJUSTMENT_FILTERS, 2, 25)).toEqual({ pageNumber: 2, pageSize: 25 });
    });

    /* The keys GET /stock-adjustments declares; anything else would be dropped silently (trap #2). */
    it('sends each filter under the name the endpoint declares', () => {
        expect(toAdjustmentParams({
            storeId: '4', branchId: '9', reason: 'DAMAGED', assetTypeId: '3', search: '  toner ',
            from: '2026-11-01', to: '2026-11-14',
        }, 0, 50)).toEqual({
            pageNumber: 0, pageSize: 50, storeId: 4, branchId: 9, reason: 'DAMAGED', assetTypeId: 3,
            search: 'toner', from: '2026-11-01T00:00:00', to: '2026-11-14T23:59:59',
        });
    });

    /* Local wall-clock times: toISOString() would send UTC and shift the window by three hours. */
    it('sends dates as local whole days, never as UTC instants', () => {
        const p = toAdjustmentParams({ ...EMPTY_ADJUSTMENT_FILTERS, from: '2026-11-01', to: '2026-11-01' }, 0, 25);
        expect(p.from).toBe('2026-11-01T00:00:00');
        expect(p.to).toBe('2026-11-01T23:59:59');
        expect(String(p.from)).not.toMatch(/Z$/);
    });
});

describe('adjustment history export', () => {
    it('signs the change, names the reason, and leaves a reversal without a count', () => {
        const [row] = buildAdjustmentExportRows([{
            id: 1, commodityName: 'Toner', assetTypeName: 'Printing & Branding', storeName: 'Gulu Admin Store',
            branchName: 'Gulu', quantityBefore: 10, quantityAfter: 12, quantityDelta: 2, reason: 'STOCK_REVERSAL',
            postedAt: '2026-11-14T10:30:00', postedByName: 'Jane Doe',
        }]);
        expect(row).toMatchObject({
            commodity: 'Toner', change: '+2', reason: 'Stock order reversal', count: '', postedBy: 'Jane Doe',
        });
    });

    it('prints the active filters on the PDF strip, by name', () => {
        const strip = describeAdjustmentFilters(
            { ...EMPTY_ADJUSTMENT_FILTERS, storeId: '4', reason: 'LOST_OR_STOLEN' },
            {
                byReason: [], adjustments: [], totalLines: 0, unitsWrittenUp: 0, unitsWrittenDown: 0,
                storeOptions: [{ id: 4, name: 'Gulu Admin Store', branchId: 9, branchName: 'Gulu' }],
            },
        );
        expect(strip).toEqual([
            { label: 'Store', value: 'Gulu Admin Store' },
            { label: 'Reason', value: 'Lost or stolen' },
        ]);
    });
});

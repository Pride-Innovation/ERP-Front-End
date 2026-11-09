/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { availableOf, balanceLabel, drawableStores, movableAssets } from './drawRules';

describe('what the movement form offers', () => {
    const stores = [{ id: 1, locationId: 10 }, { id: 2, locationId: 20 }, { id: 3, locationId: 10 }];

    it('draws only from stores at your own branch; the super administrator from any', () => {
        expect(drawableStores(stores, 10, false).map((s) => s.id)).toEqual([1, 3]);
        expect(drawableStores(stores, null, false)).toEqual([]);
        expect(drawableStores(stores, null, true).map((s) => s.id)).toEqual([1, 2, 3]);
    });

    it('offers only assets free on the shelf', () => {
        const a = (id: number, extra: object = {}) => ({ id, assetStatus: { status: 'issuanceAvailable' }, ...extra });
        const offered = movableAssets([
            a(1),
            a(2, { assignedTo: { id: 5 } }),
            a(3, { temporaryPool: true }),
            a(4, { assetStatus: { status: 'inMaintenance' } }),
            a(5, { assetStatus: { status: 'requireUpdate' } }),
            a(6, { disposed: true }),
            a(7, { assetStatus: null }),
        ]).map((x) => x.id);
        expect(offered).toEqual([1, 7]);
    });

    it('counts what is still available, and says so when some is promised', () => {
        expect(availableOf({ quantity: 10, available: 8 })).toBe(8);
        expect(availableOf({ quantity: 10 })).toBe(10);
        expect(balanceLabel({ commodityName: 'Pens', quantity: 10, available: 8 })).toBe('Pens (8 available, 10 on hand)');
        expect(balanceLabel({ commodityName: 'Pens', quantity: 10, available: 10 })).toBe('Pens (10 in stock)');
    });
});

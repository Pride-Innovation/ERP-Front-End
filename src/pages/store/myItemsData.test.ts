/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IAwayItem, awayWhereLabel, groupByCategory } from './myItemsData';

describe('My Items', () => {
    it('groups by category and sorts both levels by name, uncategorised items included', () => {
        const groups = groupByCategory([
            { id: 1, name: 'Office chair', assetTypeName: 'Furniture' },
            { id: 2, name: 'Laptop', assetTypeName: 'Computers' },
            { id: 3, name: 'Desk', assetTypeName: 'Furniture' },
            { id: 4, name: 'Box', assetTypeName: null },
        ]);
        expect(groups.map((g) => g.category)).toEqual(['Computers', 'Furniture', 'Uncategorised']);
        expect(groups[1].items.map((i) => i.id)).toEqual([3, 1]);
    });

    it('says where an away item is and why', () => {
        const away = (extra: Partial<IAwayItem>): IAwayItem => ({ id: 1, purpose: 'repair', returning: false, ...extra });
        expect(awayWhereLabel(away({ heldAt: 'Head Office IT Store' }))).toBe('Head Office IT Store · for repair');
        expect(awayWhereLabel(away({ heldAt: 'Disposal Store', purpose: 'disposal' }))).toBe('Disposal Store · for disposal');
        // Dispatched but not yet received at Head Office: no store yet.
        expect(awayWhereLabel(away({ heldAt: null }))).toBe('For repair');
    });
});

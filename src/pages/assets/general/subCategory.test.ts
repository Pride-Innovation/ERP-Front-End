/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { NO_SUB_CATEGORY, subCategoryOptions, subCategoryParams, subCategorySummary } from './subCategory';

describe('asset sub-category', () => {
    const options = subCategoryOptions([
        { id: 3, name: 'Table' },
        { id: 1, name: 'Chair' },
        { id: null, name: 'no id' },
        { id: 9, name: '' },
    ]);

    it('offers the category\'s sub-categories by name, then "Not set"', () => {
        expect(options).toEqual([
            { value: 1, label: 'Chair' },
            { value: 3, label: 'Table' },
            { value: NO_SUB_CATEGORY, label: 'Not set' },
        ]);
    });

    it('sends a chosen sub-category as commodityId, untouched otherwise', () => {
        expect(subCategoryParams({ commodityId: 3, model: 'X' })).toEqual({ commodityId: 3, model: 'X' });
    });

    /** "Not set" is not an id: sending it as commodityId would be a 400 or match nothing. */
    it('sends "Not set" as noCommodity and never as commodityId', () => {
        const params = subCategoryParams({ commodityId: NO_SUB_CATEGORY, model: 'X' });
        expect(params).toEqual({ noCommodity: true, model: 'X' });
        expect(params).not.toHaveProperty('commodityId');
    });

    it('sends nothing when no sub-category is chosen', () => {
        expect(subCategoryParams({ model: 'X' })).toEqual({ model: 'X' });
        expect(subCategoryParams({ commodityId: '' })).toEqual({});
        expect(subCategoryParams({ commodityId: null })).toEqual({});
    });

    it('names the choice for the filter summary and the export strip', () => {
        expect(subCategorySummary(3, options)).toBe('Table');
        expect(subCategorySummary('3', options)).toBe('Table');
        expect(subCategorySummary(NO_SUB_CATEGORY, options)).toBe('Not set');
        expect(subCategorySummary(undefined, options)).toBeNull();
        expect(subCategorySummary(42, options)).toBe('#42');
    });
});

import { toStoreFilterParams } from './TableData';

describe('store balance filters', () => {
    it('sends only the declared, non-empty filters', () => {
        expect(toStoreFilterParams({
            stockName: '  chair ', stockLevel: 'unmonitored', stockLevel__label: 'No reorder level set', other: '',
        })).toEqual({ stockName: 'chair', stockLevel: 'unmonitored' });
    });

    it('treats a cleared filter bar as no filters', () => {
        expect(toStoreFilterParams({})).toEqual({});
        expect(toStoreFilterParams({ stockName: '', stockLevel: undefined })).toEqual({});
    });
});

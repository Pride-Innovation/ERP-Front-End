import { stockCheckSummary, IStockCheck } from './stockCheck';

const check = (over: Partial<IStockCheck>): IStockCheck => ({
    storeId: 5, storeName: 'Gulu Admin Store', waiting: false,
    lines: [{ commodityId: 1, commodityName: 'A4 paper', needed: 10, available: 12 }],
    ...over,
});

describe('what the request page says about stock at the Issue step', () => {
    it('names the store and every short line when it is waiting', () => {
        const s = stockCheckSummary(check({
            waiting: true,
            lines: [
                { commodityId: 1, commodityName: 'A4 paper', needed: 10, available: 3 },
                { commodityId: 2, commodityName: 'Pens', needed: 5, available: 5 },
            ],
        }));
        expect(s?.waiting).toBe(true);
        expect(s?.message).toContain('Gulu Admin Store');
        expect(s?.shortLines.map((l) => l.commodityName)).toEqual(['A4 paper']);
    });

    it('says it can be issued when the store covers it', () => {
        expect(stockCheckSummary(check({}))?.title).toBe('In stock');
    });

    it('says nothing when it cannot know - an unknown is not a shortfall', () => {
        expect(stockCheckSummary(check({ storeId: null }))).toBeNull();
        expect(stockCheckSummary(check({ lines: [] }))).toBeNull();
    });
});

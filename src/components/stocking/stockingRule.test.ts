import { describeStockingRule, isNowhere } from './stockingRule';

const names: Record<number, string> = { 2: 'Gulu Branch', 3: 'Mbarara Branch', 4: 'Lira Branch' };
const nameOf = (id: number) => names[id];

describe('describeStockingRule', () => {
    it('reads Head Office alone as "only"', () => {
        expect(describeStockingRule({ stockAtHeadOffice: true }, nameOf)).toBe('Head Office only');
    });

    it('joins Head Office and all branches', () => {
        expect(describeStockingRule({ stockAtHeadOffice: true, stockAtAllBranches: true }, nameOf))
            .toBe('Head Office + all branches');
    });

    it('spells out one or two named branches', () => {
        expect(describeStockingRule({ stockingBranchIds: [2] }, nameOf)).toBe('Gulu Branch only');
        expect(describeStockingRule({ stockAtHeadOffice: true, stockingBranchIds: [2, 3] }, nameOf))
            .toBe('Head Office + Gulu Branch + Mbarara Branch');
    });

    it('counts three or more, or any it cannot name yet', () => {
        expect(describeStockingRule({ stockingBranchIds: [2, 3, 4] }, nameOf)).toBe('3 branches only');
        expect(describeStockingRule({ stockingBranchIds: [9] }, nameOf)).toBe('1 branch only');
    });

    it('ignores the named list once all branches is on', () => {
        expect(describeStockingRule({ stockAtAllBranches: true, stockingBranchIds: [2] }, nameOf)).toBe('All branches, not Head Office');
    });

    it('says so when nothing is ticked', () => {
        expect(isNowhere({ stockAtHeadOffice: false, stockAtAllBranches: false, stockingBranchIds: [] })).toBe(true);
        expect(describeStockingRule({ stockAtHeadOffice: false }, nameOf)).toBe('Not stockable anywhere');
    });
});

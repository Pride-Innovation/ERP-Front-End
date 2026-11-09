import { toRow } from './DisposalReport';

describe('disposal report rows', () => {
    it('names the branch the asset was disposed from, not the Disposal store’s', () => {
        const row = toRow({
            id: 1, assetName: 'Laptop', branch: { name: 'Head Office' }, disposedFromBranchName: 'Gulu Branch',
        });
        expect(row.branch).toBe('Gulu Branch');
    });

    it('falls back to the asset’s branch for a server that does not send it', () => {
        expect(toRow({ id: 2, branch: { name: 'Head Office' } }).branch).toBe('Head Office');
        expect(toRow({ id: 3 }).branch).toBe('—');
    });
});

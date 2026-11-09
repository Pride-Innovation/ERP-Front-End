import { toRow } from './MaintenanceReport';

describe('maintenance report rows', () => {
    it('names the branch that sent the asset, not where it is on the bench', () => {
        const row = toRow({
            id: 2361, status: 'Pending', sentFromBranchName: 'Gulu Branch',
            asset: { assetName: 'Chair', branch: { name: 'Head Office' } },
        });
        expect(row.branch).toBe('Gulu Branch');
    });

    it('falls back to the asset’s branch for a server that does not send the sender', () => {
        expect(toRow({ id: 1, asset: { branch: { name: 'Mbarara' } } }).branch).toBe('Mbarara');
        expect(toRow({ id: 2 }).branch).toBe('—');
    });
});

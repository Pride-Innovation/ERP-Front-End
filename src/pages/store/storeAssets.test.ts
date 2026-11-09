import {
    EMPTY_STORE_ASSET_FILTERS,
    buildStoreAssetExportRows,
    describeStoreAssetFilters,
    pickLocationStore,
    toStoreAssetParams,
} from './storeAssets';

describe('store assets table', () => {
    const sort = { by: 'assetName', direction: 'ASC' as const };

    it('sends only the filters that are set, and always the page and sort', () => {
        expect(toStoreAssetParams(EMPTY_STORE_ASSET_FILTERS, 2, 25, sort)).toEqual({
            pageNumber: 2, pageSize: 25, sortBy: 'assetName', sortDirection: 'ASC',
        });
    });

    it('types each filter the way the endpoint declares it', () => {
        const params = toStoreAssetParams(
            { search: '  laptop ', assetTypeId: '3', statusCode: 'inMaintenance', loanable: 'false', originBranchId: '49' },
            0, 10, sort,
        );
        expect(params).toMatchObject({
            search: 'laptop', assetTypeId: 3, statusCode: 'inMaintenance', loanable: false, originBranchId: 49,
        });
    });

    it('names the active filters by label for the printed strip', () => {
        const strip = describeStoreAssetFilters(
            { ...EMPTY_STORE_ASSET_FILTERS, assetTypeId: '3', loanable: 'true' },
            { categories: [{ value: '3', label: 'Computers' }], statuses: [], originBranches: [] },
        );
        expect(strip).toEqual([
            { label: 'Category', value: 'Computers' },
            { label: 'Loanable', value: 'Yes' },
        ]);
    });

    it('builds flat, printable export rows', () => {
        const [row] = buildStoreAssetExportRows([{
            id: 1, assetName: 'HP EliteBook', assetTypeName: 'Computers', statusName: 'In Maintenance',
            loanable: false, originBranchName: 'Gulu Branch', holdingBranchName: 'Head Office',
        }]);
        expect(row).toMatchObject({
            assetName: 'HP EliteBook', category: 'Computers', status: 'In Maintenance',
            loanable: 'No', sentFrom: 'Gulu Branch', location: 'Head Office', engravedNumber: '',
        });
        Object.values(row).forEach((v) => expect(typeof v).not.toBe('object'));
    });

    it("takes the branch's own store, not a department's at the same branch", () => {
        expect(pickLocationStore([
            { id: 9, name: 'Finance store', departmentId: 4 },
            { id: 1, name: 'Head Office Admin Store', departmentId: null },
        ])?.id).toBe(1);
        expect(pickLocationStore([{ id: 9, departmentId: 4 }])?.id).toBe(9);
        expect(pickLocationStore([])).toBeNull();
    });

    it('asks for the branch’s away assets only when told to', () => {
        expect(toStoreAssetParams(EMPTY_STORE_ASSET_FILTERS, 0, 25, sort)).not.toHaveProperty('includeAwayForRepair');
        expect(toStoreAssetParams(EMPTY_STORE_ASSET_FILTERS, 0, 25, sort, true))
            .toMatchObject({ includeAwayForRepair: true });
    });

    it('says which store each exported row is held at', () => {
        const [away] = buildStoreAssetExportRows([{
            id: 1530, assetName: 'Chair', loanable: false, storeId: 1, storeName: 'Head Office Admin Store',
        }]);
        expect(away.heldAt).toBe('Head Office Admin Store');
    });
});

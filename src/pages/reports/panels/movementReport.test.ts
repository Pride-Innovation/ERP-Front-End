import { toRows } from './MovementReport';

describe('movement report rows', () => {
    const base = {
        id: 7, status: 'COMPLETED', createDate: '2026-10-01T10:00:00',
        initiator: { firstName: 'Issuer', lastName: 'Admin' },
        recipientUser: { firstName: 'Jane', lastName: 'Akello' },
    };

    it('names the requester on a delivery, and the initiator otherwise', () => {
        expect(toRows({ ...base, request: { id: 3, requesterName: 'Peter Okello' } })[0].requestedBy).toBe('Peter Okello');
        expect(toRows(base)[0].requestedBy).toBe('Issuer Admin');
    });

    it('shows each line’s category, for assets and commodities alike', () => {
        const rows = toRows({
            ...base,
            items: [
                { id: 1, asset: { assetName: 'Laptop', assetTypeName: 'Computers' } },
                { id: 2, commodity: { name: 'A4 paper', assetTypeName: 'Stationery' } },
            ],
        });
        expect(rows.map((r) => r.category)).toEqual(['Computers', 'Stationery']);
    });

    it('carries the plate and tracking number for a movement on the road, split for the screen', () => {
        const [row] = toRows({
            ...base, status: 'IN_TRANSIT', courier: { name: 'Safe Boda' },
            plateNumber: 'UBA 123X', trackingNumber: 'TRK-2026-000042-5',
        });
        expect(row.currentlyWithHeadline).toBe('In transit · Safe Boda');
        expect(row.currentlyWithDetail).toBe('Plate UBA 123X · TRK-2026-000042-5');
        expect(row.currentlyWith).toBe('In transit · Safe Boda · Plate UBA 123X · TRK-2026-000042-5');
    });

    it('says who has a completed movement, not a blank', () => {
        expect(toRows(base)[0].currentlyWith).toBe('Delivered · Jane Akello');
    });
});

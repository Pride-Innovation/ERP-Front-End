import { movementCurrentlyWith, movementCurrentlyWithHeadline, movementTransitDetail } from './movementCurrentlyWith';

describe('movement "Currently With"', () => {
    const jane = { firstName: 'Jane', lastName: 'Akello' };

    it('names whoever has it at each stage', () => {
        expect(movementCurrentlyWith({ status: 'DRAFT', currentApprover: jane })).toBe('Awaiting approval · Jane Akello');
        expect(movementCurrentlyWith({ status: 'INITIATED', sourceStore: { name: 'Gulu Branch Admin Store' } }))
            .toBe('Awaiting dispatch · Gulu Branch Admin Store');
        expect(movementCurrentlyWith({ status: 'IN_TRANSIT', courier: { name: 'Safe Boda' } })).toBe('In transit · Safe Boda');
        expect(movementCurrentlyWith({ status: 'DISPATCHED', courierService: 'DHL' })).toBe('In transit · DHL');
        expect(movementCurrentlyWith({ status: 'RECEIVED', receivingOfficer: jane })).toBe('Received · Jane Akello');
        expect(movementCurrentlyWith({ status: 'CANCELLED' })).toBe('Cancelled');
    });

    it('prefers the person a completed movement was delivered to, then the store', () => {
        expect(movementCurrentlyWith({ status: 'COMPLETED', recipientUser: jane, destStore: { name: 'IT Store' } }))
            .toBe('Delivered · Jane Akello');
        expect(movementCurrentlyWith({ status: 'COMPLETED', destStore: { name: 'Head Office IT Store' } }))
            .toBe('Delivered · Head Office IT Store');
    });

    it('adds the plate, tracking number and courier reference while on the road', () => {
        const onTheRoad = {
            status: 'IN_TRANSIT', courier: { name: 'Safe Boda' },
            plateNumber: 'UBA 123X', trackingNumber: 'TRK-2026-000042-5',
        };
        expect(movementTransitDetail(onTheRoad)).toBe('Plate UBA 123X · TRK-2026-000042-5');
        expect(movementCurrentlyWithHeadline(onTheRoad)).toBe('In transit · Safe Boda');
        expect(movementCurrentlyWith(onTheRoad)).toBe('In transit · Safe Boda · Plate UBA 123X · TRK-2026-000042-5');
        expect(movementTransitDetail({ ...onTheRoad, courierReference: 'SB-991' }))
            .toBe('Plate UBA 123X · TRK-2026-000042-5 · Ref SB-991');
    });

    it('leaves out what is missing, and adds nothing once off the road', () => {
        expect(movementTransitDetail({ status: 'DISPATCHED', trackingNumber: 'TRK-2026-000043-3', plateNumber: '  ' }))
            .toBe('TRK-2026-000043-3');
        expect(movementTransitDetail({ status: 'IN_TRANSIT' })).toBeNull();
        expect(movementCurrentlyWith({ status: 'IN_TRANSIT', courier: { name: 'Safe Boda' } })).toBe('In transit · Safe Boda');
        expect(movementTransitDetail({ status: 'COMPLETED', trackingNumber: 'TRK-2026-000042-5' })).toBeNull();
    });

    it('says the stage even when the party is missing, never an empty cell', () => {
        expect(movementCurrentlyWith({ status: 'DRAFT' })).toBe('Awaiting approval');
        expect(movementCurrentlyWith({ status: 'COMPLETED' })).toBe('Delivered');
        expect(movementCurrentlyWith({ status: undefined })).toBe('—');
    });
});

import { FULFILMENT_RING_COLOURS, FULFILMENT_RING_OTHER } from '../chartTheme';
import { buildFulfilmentRings } from './fulfilmentRings';

const row = (assetType: string, totalRequested: number, totalDelivered: number) =>
    ({ assetType, totalRequested, totalDelivered });

/** The categories from the dashboard screenshot, plus two small ones so "Other" has something to fold. */
const rows = [
    row('Furniture', 108, 90),
    row('Computers', 150, 100),
    row('Stationery', 115, 60),
    row('Equipment', 10, 8),
    row('Building & Construction', 5, 3),
    row('Kitchen & Groceries', 4, 0),
    row('Cleaning & Hygiene', 2, 0),
];

describe('buildFulfilmentRings', () => {
    it('keeps the totals exactly what the bar view shows', () => {
        const rings = buildFulfilmentRings(rows);
        const requested = rows.reduce((s, r) => s + r.totalRequested, 0);
        const delivered = rows.reduce((s, r) => s + r.totalDelivered, 0);
        expect(rings.requested).toBe(requested);
        expect(rings.delivered).toBe(delivered);
        expect(rings.slices.reduce((s, x) => s + x.requested, 0)).toBe(requested);
        expect(rings.slices.reduce((s, x) => s + x.delivered, 0)).toBe(delivered);
    });

    it('draws the five largest categories in palette order, largest first, and folds the rest into Other', () => {
        const { slices } = buildFulfilmentRings(rows);
        expect(slices.map((s) => s.label)).toEqual([
            'Computers', 'Stationery', 'Furniture', 'Equipment', 'Building & Construction', 'Other (2)',
        ]);
        expect(slices.slice(0, 5).map((s) => s.colour)).toEqual([...FULFILMENT_RING_COLOURS]);
        const other = slices[5];
        expect(other.colour).toBe(FULFILMENT_RING_OTHER);
        expect(other.members).toEqual(['Kitchen & Groceries', 'Cleaning & Hygiene']);
        expect(other.requested).toBe(6);
    });

    it('splits every slice into parts that add up to it, so the rings line up', () => {
        for (const slice of buildFulfilmentRings(rows).slices) {
            expect(slice.delivered + slice.outstanding).toBe(slice.requested);
        }
    });

    it('works out each share and delivered rate', () => {
        const computers = buildFulfilmentRings(rows).slices[0];
        expect(computers.share).toBeCloseTo((150 / 394) * 100);
        expect(computers.deliveredRate).toBeCloseTo((100 / 150) * 100);
    });

    it('names a lone remainder rather than calling it Other', () => {
        const { slices } = buildFulfilmentRings(rows.slice(0, 6));
        expect(slices[5].label).toBe('Kitchen & Groceries');
        expect(slices[5].colour).toBe(FULFILMENT_RING_OTHER);
    });

    it('has no Other when five or fewer categories have requests, and skips categories with none', () => {
        const { slices } = buildFulfilmentRings([...rows.slice(0, 4), row('Vehicles', 0, 0)]);
        expect(slices.map((s) => s.label)).toEqual(['Computers', 'Stationery', 'Furniture', 'Equipment']);
    });

    it('gives the same colours to the same data whatever order it arrives in', () => {
        const a = buildFulfilmentRings(rows).slices.map((s) => `${s.label}:${s.colour}`);
        const b = buildFulfilmentRings([...rows].reverse()).slices.map((s) => `${s.label}:${s.colour}`);
        expect(b).toEqual(a);
    });
});

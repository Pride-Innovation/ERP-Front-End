/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { normaliseUnit, unitLabel, unitOptions } from './unitsOfMeasure';

const units = [
    { id: 1, name: 'boxes', active: true },
    { id: 2, name: 'pieces', active: true },
];

describe('units of measure', () => {
    it('labels a stored unit for display', () => {
        expect(unitLabel('pieces')).toBe('Pieces');
        expect(unitLabel('metric tonnes')).toBe('Metric tonnes');
    });

    it('normalises the way the server stores a unit', () => {
        expect(normaliseUnit('  Metric   TONNES ')).toBe('metric tonnes');
        expect(normaliseUnit(null)).toBe('');
    });

    it('offers the active units, stored value as the option value', () => {
        expect(unitOptions(units)).toEqual([
            { label: 'Boxes', value: 'boxes' },
            { label: 'Pieces', value: 'pieces' },
        ]);
    });

    /** Otherwise a record carrying a switched-off unit would open with the field empty. */
    it("keeps the record's own unit selectable even when it is no longer offered", () => {
        const options = unitOptions(units, 'Litres');
        expect(options[0]).toEqual({ label: 'Litres (no longer offered)', value: 'litres' });
        expect(unitOptions(units, 'PIECES')).toHaveLength(2);
    });
});

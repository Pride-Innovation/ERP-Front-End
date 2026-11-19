/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { referenceId } from './referenceId';

describe('referenceId', () => {
    it('keeps an id', () => {
        expect(referenceId(42)).toBe(42);
        expect(referenceId('42')).toBe(42);
    });

    /** The failure that reached the server: a whole supplier record where an id belongs. */
    it('reads the id out of a record or an option', () => {
        expect(referenceId({ id: 7, name: 'Acme Supplies', email: 'x@example.com' })).toBe(7);
        expect(referenceId({ value: 9, label: 'Okello John' })).toBe(9);
    });

    it('turns anything missing or unreadable into null, never undefined', () => {
        [null, undefined, '', 'abc', {}, { name: 'no id' }, NaN].forEach((v) => {
            expect(referenceId(v)).toBeNull();
        });
    });
});

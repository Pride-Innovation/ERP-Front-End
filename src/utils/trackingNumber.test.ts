/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { isValidTrackingNumber, trackingNumberTypo } from './trackingNumber';

/**
 * The browser's copy of the check digit must agree with the server's, digit for digit.
 *
 * <p>`TRK-2026-000042-5` is asserted by TrackingNumberTest on the server too. If the two algorithms
 * drifted, the search box would call real numbers mistyped - or wave real typos through.
 */
describe('tracking numbers', () => {
    it('accepts the vector the server issues', () => {
        expect(isValidTrackingNumber('TRK-2026-000042-5')).toBe(true);
        expect(isValidTrackingNumber('trk-2026-000042-5')).toBe(true);
    });

    it('flags a mistyped digit', () => {
        expect(isValidTrackingNumber('TRK-2026-000043-5')).toBe(false);
        expect(trackingNumberTypo('TRK-2026-000043-5')).toMatch(/mistyped/);
    });

    it('leaves partial input and pre-system numbers alone', () => {
        expect(trackingNumberTypo('TRK-2026')).toBeNull();
        expect(trackingNumberTypo('TRK-463728')).toBeNull();
        expect(trackingNumberTypo('')).toBeNull();
    });
});

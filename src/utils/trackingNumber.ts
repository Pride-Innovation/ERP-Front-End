/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/**
 * Tracking numbers issued by the system: TRK-<year>-<sequence>-<Luhn check digit>.
 *
 * <p>Mirrors TrackingNumberService on the server. The check digit is what lets a search box say
 * "that number is mistyped" instead of returning nothing, which reads exactly like "no such parcel".
 */

const FORMAT = /^TRK-(\d{4})-(\d{6,})-(\d)$/;

const luhnCheckDigit = (payload: string): number => {
    let sum = 0;
    let double = true;
    for (let i = payload.length - 1; i >= 0; i--) {
        let d = payload.charCodeAt(i) - 48;
        if (double) {
            d *= 2;
            if (d > 9) d -= 9;
        }
        sum += d;
        double = !double;
    }
    return (10 - (sum % 10)) % 10;
};

/** Whether this is a well-formed, system-issued number with a valid check digit. */
export const isValidTrackingNumber = (value: string): boolean => {
    const m = FORMAT.exec(value.trim().toUpperCase());
    return !!m && luhnCheckDigit(m[1] + m[2]) === Number(m[3]);
};

/**
 * Set when the text has the full shape of an issued number but its check digit fails - a mistyping.
 * Partial input and numbers typed before the system issued them are left alone; those are ordinary
 * searches, not errors.
 */
export const trackingNumberTypo = (value?: string | null): string | null => {
    const v = (value ?? '').trim().toUpperCase();
    if (!FORMAT.test(v)) return null;
    return isValidTrackingNumber(v) ? null : 'That tracking number does not check out — a digit may be mistyped.';
};

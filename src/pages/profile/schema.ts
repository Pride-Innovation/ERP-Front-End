/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import dayjs from 'dayjs';
import * as yup from 'yup';

export const changePasswordSchema = yup.object().shape({
    oldPassword: yup.string().required('Old Password is required'),
    /*
     * Mirrors `PasswordPolicy` on the server, deliberately.
     *
     * Not as a substitute for it — the server is the authority and enforces this regardless — but so
     * the rule is visible while typing rather than arriving as a refusal after submitting. A client
     * check that is *looser* than the server's, which this was (non-empty, nothing else), turns every
     * rejection into a surprise.
     *
     * If the two drift, the server wins and the form merely stops being helpful; that is the safe
     * direction, and the reason the message here quotes the same wording.
     */
    newPassword: yup.string()
        .required('Please enter your password.')
        .min(10, 'Your password must be at least 10 characters long.')
        .max(128, 'Your password must be no longer than 128 characters.')
        .test('no-edge-spaces', 'Your password must not start or end with a space.',
            (value) => !value || value === value.trim())
        .test(
            'character-classes',
            'Your password must include at least three of: a capital letter, a small letter, '
            + 'a number, and a symbol.',
            (value) => {
                if (!value) return true;   // `required` above reports an empty one
                const classes = [
                    /[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9\s]/,
                ].filter((pattern) => pattern.test(value)).length;
                return classes >= 3;
            },
        ),
    confirmPassword: yup.string().required('Please retype your password.')
        .oneOf([yup.ref('newPassword')], 'Your passwords do not match.')
});


export const leaveSchema = yup.object({
    leaveType: yup.string().required('Please select leave type'),
    actingPerson: yup.number().required('Please select someone to act in your absence'),
    reason: yup.string()
        // .min(10, 'Please provide more details (minimum 10 characters)')
        .nullable()
        .optional(),
    // Transform mixed values to Dayjs before validation
    startDate: yup.mixed()
        .transform((value) => (value ? dayjs(value) : null))
        .nullable()
        .optional(),
    endDate: yup.mixed()
        .transform((value) => (value ? dayjs(value) : null))
        .nullable()
        .optional()
});
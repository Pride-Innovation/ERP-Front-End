/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';

// Letters, spaces, hyphens, apostrophes only. Must start with a letter.
const NAME_REGEX = /^[A-Za-z][A-Za-z'\- ]*$/;
const NAME_MESSAGE = 'Only letters, spaces, hyphens and apostrophes are allowed';

// Pride Bank corporate email domain. Mirrors the backend @Pattern on UserDTO.email.
const PRIDE_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@pridebank\.co\.ug$/;

export const userSchema = yup.object({
    firstName: yup
        .string()
        .trim()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters')
        .max(30, 'First name cannot exceed 30 characters')
        .matches(NAME_REGEX, NAME_MESSAGE),

    lastName: yup
        .string()
        .trim()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters')
        .max(30, 'Last name cannot exceed 30 characters')
        .matches(NAME_REGEX, NAME_MESSAGE),

    otherName: yup
        .string()
        .trim()
        .transform((v: string) => (v === '' ? null : v))
        .nullable()
        .notRequired()
        .matches(NAME_REGEX, { message: NAME_MESSAGE, excludeEmptyString: true }),

    email: yup
        .string()
        .trim()
        .required('Email address is required')
        .matches(PRIDE_EMAIL_REGEX, 'Email must be a Pride Bank address (…@pridebank.co.ug)'),

    gender: yup
        .string()
        .required('Gender is required')
        .oneOf(['male', 'female'], 'Gender must be Male or Female'),

    staffNumber: yup
        .string()
        .trim()
        .required('Staff number is required'),

    availability: yup
        .string()
        .oneOf(['present', 'absent'], 'Availability must be Present or Absent')
        .default('present'),

    title: yup
        .number()
        .typeError('Please select a Title')
        .required('Title is required'),

    branch: yup
        .number()
        .typeError('Please select a Duty Station')
        .required('Duty Station is required'),

    // Department is required only when the selected branch is the Head Office.
    // The form passes `meta.isHeadOffice` via yup context so this rule stays declarative.
    department: yup
        .number()
        .typeError('Please select a Department')
        .nullable()
        .when('$isHeadOffice', {
            is: true,
            then: (s) => s.required('Department is required for Head Office staff'),
            otherwise: (s) => s.notRequired(),
        }),
});

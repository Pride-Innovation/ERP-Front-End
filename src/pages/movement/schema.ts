/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';

export const movementSchema = yup.object().shape({
    officerId: yup.mixed().required('Requesting officer is required'),
    destination: yup.string().required('Destination is required'),
    destinationType: yup.string().required('Destination type is required'),
    reason: yup.string().required('Reason is required'),
    expectedReturnDate: yup.string().nullable().optional(),
});

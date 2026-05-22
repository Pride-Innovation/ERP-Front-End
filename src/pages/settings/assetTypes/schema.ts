/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';

export const assetTypeSchema = yup.object({
    name: yup.string().required('Category name is required').min(2, 'Name must be at least 2 characters'),
    shortCode: yup
        .string()
        .max(5, 'Short code must be 5 characters or fewer')
        .nullable()
        .optional(),
    description: yup.string().nullable().optional(),
    ownerGroupEmail: yup
        .string()
        .email('Owner group email must be a valid email')
        .nullable()
        .optional(),
});

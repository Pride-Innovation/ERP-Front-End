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
    depreciationRate: yup
        .string()
        .nullable()
        .optional()
        .test(
            'is-valid-rate',
            'Depreciation rate must be a number between 0 and 100',
            (value) => {
                if (value == null || value.trim() === '') return true;
                const n = Number(value);
                return !Number.isNaN(n) && n >= 0 && n <= 100;
            }
        ),
    usefulLifeMonths: yup
        .string()
        .nullable()
        .optional()
        .test(
            'is-valid-useful-life',
            'Useful life must be a whole number of months greater than 0',
            (value) => {
                if (value == null || value.trim() === '') return true;
                const n = Number(value);
                return Number.isInteger(n) && n > 0;
            }
        ),
    tracksAssets: yup.boolean().optional(),
    repairable: yup.boolean().optional(),
    repairDestination: yup
        .string()
        .nullable()
        .optional()
        .oneOf(['', 'IT', 'ADMIN', 'EXTERNAL', null], 'Repair destination must be IT, Admin or External'),
});

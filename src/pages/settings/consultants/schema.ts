/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';

export const consultantSchema = yup.object({
    name: yup.string().required('Consultant name is required').min(2, 'Name must be at least 2 characters'),
    contactPerson: yup.string().nullable().optional(),
    phone: yup.string().nullable().optional(),
    email: yup.string().email('Email must be a valid email address').nullable().optional(),
    address: yup.string().nullable().optional(),
    specialization: yup.string().nullable().optional(),
    active: yup.boolean().optional(),
});

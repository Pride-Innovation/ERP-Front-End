/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';

export const supplierSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().trim().email('Invalid email format').required('Email Address is required'),
    telephone: yup.string()
        .trim()
        .matches(/^\+256\d{9}$/, 'Must be a valid Ugandan number (e.g. +256700000000)')
        .required('Telephone Number is required'),
    address: yup.string().nullable().optional(),
    commodities: yup.array().of(yup.number().required()).nullable().optional(),
});

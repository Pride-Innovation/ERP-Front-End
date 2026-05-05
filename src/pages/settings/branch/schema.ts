/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';

export const branchSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().trim().email('Invalid email format').required('Email Address is required'),
    telephone: yup
        .string()
        .required('Telephone is required')
        .matches(/^\+256\d{9}$/, 'Must be a valid Ugandan phone number (e.g. +256700000000)'),
    region: yup
        .number()
        .typeError('Region is required')
        .required('Region is required'),
    district: yup
        .number()
        .typeError('District is required')
        .required('District is required'),
});
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
    tel: yup.string().trim().required('Telephone Number is required'),
    desc: yup.string().nullable().optional(),
    status: yup.string().nullable().optional(),
    image: yup.mixed().nullable().optional(),
    symbol: yup.string().nullable().optional(),
});

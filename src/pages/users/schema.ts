/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';

export const userSchema = yup.object().shape({
    firstName: yup.string().required('First Name is required'),
    lastName: yup.string().required('Last Name is required'),
    otherName: yup.string().nullable().optional(),
    email: yup.string().required('Email Address is required').email("Invalid Email Address"),
    gender: yup.string().required('Gender is required'),
    staffNumber: yup.string().required('Staff Number is required'),
});

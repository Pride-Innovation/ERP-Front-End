/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';

export const authentiactionSchema = yup.object().shape({
    email: yup.string().required('Email Address is required').email("Invalid Email Address"),
    password: yup.string().required('Password is required'),
});

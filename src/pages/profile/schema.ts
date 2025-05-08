/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';

export const changePasswordSchema = yup.object().shape({
    oldPassword: yup.string().required('Old Password is required'),
    newPassword: yup.string().required('Please enter your password.'),
    confirmPassword: yup.string().required('Please retype your password.')
        .oneOf([yup.ref('newPassword')], 'Your passwords do not match.')
});
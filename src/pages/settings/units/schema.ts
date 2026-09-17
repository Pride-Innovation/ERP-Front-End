/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';

export const unitSchema = yup.object().shape({
    name: yup.string().required('Unit name is required'),
    groupEmail: yup.string().email('Enter a valid email address').nullable().optional(),
    departmentId: yup
        .number()
        .typeError('Department is required')
        .required('Department is required'),
});

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';

export const departmentSchema = yup.object({
    name: yup.string().required('Department name is required'),
    headOfDepartment: yup.number().required('Head of department is required').typeError('Head of department is required'),
    branch: yup.number().required('Branch is required').typeError('Branch is required'),
    managersGroupEmail: yup
        .string()
        .email('Please enter a valid email address')
        .nullable()
        .optional(),
});

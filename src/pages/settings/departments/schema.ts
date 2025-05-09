/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';

export const departmentSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    desc: yup.string().nullable().optional(),
    status: yup.number().nullable().optional(),
    image: yup.mixed().nullable().optional(),
});

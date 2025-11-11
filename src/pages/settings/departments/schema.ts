/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';
import { IUser } from '../../users/interface';
import { IBranch } from '../branch/interface';

export const departmentSchema = yup.object().shape({
    name: yup.string().required('Department name is required'),
    headOfDepartment: yup.mixed<IUser>().nullable().optional(),
    branch: yup.mixed<IBranch>().nullable().optional(),
    managersGroupEmail: yup
        .string()
        .email('Please enter a valid email address')
        .nullable()
        .optional(),
});

export type DepartmentSchemaType = yup.InferType<typeof departmentSchema>;

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';

export const unitMeasureSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    symbol: yup.string().required('Symbol is required'),
    desc: yup.string().nullable().optional(),
    status: yup.string().nullable().optional(),
    image: yup.mixed().nullable().optional(),
});

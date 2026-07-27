/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';

export const inventorySchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    lpoNumber: yup.string().required('LPO Number is required'),
    // Required on create only (this schema is not used by the update form). The delivery
    // date is the basis for asset depreciation, so it must be captured up front.
    deliveryDate: yup.string().nullable().required('Delivery date is required'),
});

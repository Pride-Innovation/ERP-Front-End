/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';

export const movementSchema = yup.object().shape({
    movementType: yup.string().required('Movement type is required'),
    sourceStoreId: yup.mixed().required('Source store is required'),
    destinationKind: yup.string().required('Destination kind is required'),
    destStoreId: yup
        .mixed()
        .nullable()
        .when('destinationKind', {
            is: 'STORE',
            then: (s) => s.required('Destination store is required'),
            otherwise: (s) => s.nullable().optional(),
        }),
    recipientUserId: yup
        .mixed()
        .nullable()
        .when('destinationKind', {
            is: 'USER',
            then: (s) => s.required('Recipient user is required'),
            otherwise: (s) => s.nullable().optional(),
        }),
    courierService: yup.string().nullable().optional(),
    trackingNumber: yup.string().nullable().optional(),
    dispatchDate: yup.string().nullable().optional(),
    expectedDeliveryDate: yup.string().nullable().optional(),
    remarks: yup.string().nullable().optional(),
});

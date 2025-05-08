/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';

export const fleetSchema = yup.object().shape({
    assetName: yup.string().required('Asset Name is required'),
    hostname: yup.string().required('Host Name is required'),
    detailNetBookValue: yup.string().required('Detail Net Book Value is required'),
    engravedNumber: yup.string().required('Engraved Number is required'),
    dateReceipt: yup.string().required('Date Receipt is required'),
    make: yup.string().required('Make is required'),
    supplier: yup.string().required('Supplier is required'),
    unitOfMeasure: yup.string().required('Unit of Measure is required'),
    purchaseCost: yup.string().required('Purchase Cost is required'),
    costOfTheAsset: yup.string().required('Cost of Asset is required'),
    assetCategory_id: yup.string().required('Cost of Asset is required'),
    netValueB: yup.string().required('Net Value is required'),
    desc: yup.string().nullable().optional(),
    image: yup.string().nullable().optional(),
    assetStatus: yup.string().nullable().optional(),
    user_id: yup.string().nullable().optional(),
    branch_id: yup.string().nullable().optional(),
    registrationNumber: yup.string().nullable().optional(),
    model: yup.string().nullable().optional(),
});

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';

export const inventorySchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    quantityInStock: yup.number().required('Quantity in Stock is required'),
    unitOfMeasure: yup.string().required('Unit of Measure is required'),
    location: yup.string().required('Location is required'),
    category: yup.string().required('Category is required'),
    reorderLevel: yup.string().required('Reorder Level is required'),
    costPrice: yup.string().required('Cost Price is required'),
    purchasePrice: yup.string().required('Purchase Price is required'),
    supplier: yup.string().required('Supplier is required'),
    description: yup.string().required('Description is required'),
    expirationDate: yup.string().required('Expiration Date is required'),
});

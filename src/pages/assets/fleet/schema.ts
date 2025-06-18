/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import * as yup from 'yup';
import { ISupplier } from '../../settings/suppliers/interface';
import { IUser } from '../../users/interface';
import { IStatus } from '../../settings/statuses/interface';
import { IAssetType } from '../../settings/assetTypes/interface';
import { IBranch } from '../../settings/branch/interface';

export const fleetSchema = yup.object().shape({
    assetName: yup.string().required('Asset name is required'),
    hostname: yup.string().required('Host name is required'),
    detailNetBookValue: yup.string().required('NetBook value is required'),
    engravedNumber: yup.string().required('Engraved number is required'),
    dateReceipt: yup.string().required('Receipt is required'),
    make: yup.string().required('Make is required'),
    unitOfMeasure: yup.string().required('Unit of measure is required'),
    purchaseCost: yup.string().required('Purchase cost is required'),
    costOfTheAsset: yup.string().required('Cost of asset is required'),
    netValueB: yup.string().required('Net value is required'),
    assetDepreciationRate: yup.string().nullable().optional(),
    description: yup.string().nullable().optional(),
    supplier: yup.mixed<ISupplier>().nullable().optional(),
    assignedTo: yup.mixed<IUser>().nullable().optional(),
    assetStatus: yup.mixed<IStatus>().nullable().optional(),
    assetType: yup.mixed<IAssetType>().nullable().optional(),
    image: yup.string().nullable().optional(),
    branch: yup.mixed<IBranch>().nullable().optional(),
    category: yup.string().nullable().optional(),
});

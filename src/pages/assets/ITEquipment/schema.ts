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

export const ITEquipmentSchema = yup.object().shape({
    assetName: yup.string().required('Name is required'),
    hostname: yup.string().required('Name is required'),
    detailNetBookValue: yup.string().required('Name is required'),
    engravedNumber: yup.string().required('Name is required'),
    dateReceipt: yup.string().required('Name is required'),
    make: yup.string().required('Name is required'),
    unitOfMeasure: yup.string().required('Name is required'),
    purchaseCost: yup.string().required('Name is required'),
    costOfTheAsset: yup.string().required('Name is required'),
    netValueB: yup.string().required('Name is required'),
    model: yup.string().nullable().optional(),
    serialNumber: yup.string().nullable().optional(),
    ram: yup.string().nullable().optional(),
    cpuSpeed: yup.string().nullable().optional(),
    hardDiskSize: yup.string().nullable().optional(),
    macAddress: yup.string().nullable().optional(),
    ipAddress: yup.string().nullable().optional(),
    interfaceType: yup.string().nullable().optional(),
    assetDepreciationRate: yup.string().nullable().optional(),
    desc: yup.string().nullable().optional(),
    category: yup.string().nullable().optional(),
    supplier: yup.mixed<ISupplier>().nullable().optional(),
    assignedTo: yup.mixed<IUser>().nullable().optional(),
    assetStatus: yup.mixed<IStatus>().nullable().optional(),
    assetType: yup.mixed<IAssetType>().nullable().optional(),
    image: yup.string().nullable().optional(),
    branch: yup.mixed<IBranch>().nullable().optional(),
});

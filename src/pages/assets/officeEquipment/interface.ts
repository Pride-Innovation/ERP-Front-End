/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Control, FieldError, FormState, UseFormRegister } from "react-hook-form";
import { ISupplier } from "../../settings/suppliers/interface";
import { IUser } from "../../users/interface";
import { IBranch } from "../../settings/branch/interface";
import { IStatus } from "../../settings/statuses/interface";
import { IAssetType } from "../../settings/assetTypes/interface";

export interface IOfficeEquipment {
    id?: string | number;
    assetName: string;
    hostname: string;
    detailNetBookValue: string;
    engravedNumber: string;
    dateReceipt: string;
    make: string;
    supplier?: ISupplier | null;
    unitOfMeasure: string;
    purchaseCost: string;
    costOfTheAsset: string;
    netValueB: string,
    assignedTo?: IUser | null;
    branch?: IBranch | null;
    assetDepreciationRate?: string | null;
    description?: string | null;
    image?: string | null;
    assetStatus?: IStatus | null;
    assetType?: IAssetType | null;
}

export interface IOfficeEquipmentExtra {
    status1: string;
    status2: string;
    status3: string;
    status4: string;
    status5: string;
    col1: string;
    col2: string;
    col3: string;
    col4: string;
    col5: string;
}

export interface IOfficeEquipmentForm {
    formState: FormState<IOfficeEquipment> & {
        errors: {
            name?: FieldError;
            assetName?: FieldError;
            hostname?: FieldError;
            detailNetBookValue?: FieldError;
            engravedNumber?: FieldError;
            dateReceipt?: FieldError;
            make?: FieldError;
            unitOfMeasure?: FieldError;
            purchaseCost?: FieldError;
            costOfTheAsset?: FieldError;
            netValueB?: FieldError,
            assetDepreciationRate?: FieldError;
            description?: FieldError;
            image?: FieldError;
        };
    };
    control: Control<IOfficeEquipment>;
    register: UseFormRegister<IOfficeEquipment>;
    buttonText: string;
    sendingRequest: boolean;
}
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Path } from "react-hook-form";
import { IOptions } from "../../components/tables/interface";
import { IITEquipment } from "./ITEquipment/interface";
import { IOfficeEquipment } from "./officeEquipment/interface";
import { IPermission } from "../settings/interface";
import { ISupplier } from "../settings/suppliers/interface";
import { IUser } from "../users/interface";
import { IBranch } from "../settings/branch/interface";
import { IStatus } from "../settings/statuses/interface";
import { IAssetType } from "../settings/assetTypes/interface";
import { ICommodity } from "../settings/commodity/interface";
import { IInventory } from "../inventory/interface";
import { IAxiosResponse, IFetchDataRequest } from "../../core/apis/interface";
import { IFleet } from "./fleet/interface";

export interface IFormData<T> {
    value: Path<T>;
    label: string;
    type: "input" | "select" | "date" | "autocomplete" | "textarea" | "time" | "number";
    options?: Array<IOptions>;
    required?: boolean;
    disabled?: boolean;
}

export interface IAssetAction {
    handleClose: () => void;
    handleClickAction?: (option: string | number, moduleID: string | number) => void;
    sendingRequest: boolean;
    buttonText: string;
    asset: IITEquipment | IOfficeEquipment | IFleet;
    module?: string;
}

// Specific action interfaces that extend the base
export type IDispose = IAssetAction;
export type IRepair = IAssetAction;
export type IReassign = IAssetAction;
export type IToStore = IAssetAction;

export interface INavigation {
    id: number;
    text: string;
    path: string;
    icon: JSX.Element;
    otherRoutes: Array<string>;
    permission?: IPermission
}

export interface IAssignmentHistory {
    id?: string | number;
    startDate: string;
    endDate: string;
    statusBefore: string;
    statusAfter: string;
    user: string;
    serialNumber: string;
}

export interface IAsset {
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
    model?: string | null;
    image?: string | null;
    assetStatus?: IStatus | null;
    assetType?: IAssetType | null;
    category?: string | null
    lpoNumber: string;
    commodity?: ICommodity | null;
    stock?: IInventory | null
}

export interface IAssetResponse extends IFetchDataRequest {
    content: Array<IAsset>
}

export interface IAssetsAxiosResponse extends IAxiosResponse {
    data: IAssetResponse
}

export interface IAssetAxiosResponse extends IAxiosResponse {
    data: IAsset
}

export interface IRepairDetails {
    id: number | string;
    repairStartDate: string;
    repairEndDate: string;
    technician: string;
    repairReason: string;
    documents: string[];
    asset: IAsset;
    status: string;
    completionNotes: string;
    completionDocuments: string[];
}

export interface IRepairDetailsResponse extends IFetchDataRequest {
    content: Array<IRepairDetails>
}

export interface IRepairDetailsAxiosResponse extends IAxiosResponse {
    data: IRepairDetailsResponse
}

export interface IRepairDetailAxiosResponse extends IAxiosResponse {
    data: IRepairDetails
}

export interface IRepairsTableData {
    id: number | string;
    repairStartDate: string;
    repairEndDate: string;
    technician: string;
    repairReason: string;
}

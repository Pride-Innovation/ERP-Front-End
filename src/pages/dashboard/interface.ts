/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IAxiosResponse } from "../../core/apis/interface";

/** Per-category asset counts, as returned by `/assets/statistics`. */
export interface IAssetTypeStats {
    assetType: string;
    /** Every asset in this category, disposed ones included. */
    total: number;
    assigned: number;
    unassigned: number;
    inMaintenance: number;
    /**
     * Assets written off.
     *
     * Added because the server previously folded these into `assigned` — the bucket was defined as
     * "any status that is not in-maintenance and not require-update", so the dashboard's In Use
     * figure counted items the bank had already disposed of. The four counts now partition `total`.
     */
    disposed: number;
}

export interface IAssetTypeStatsAxiosResponse extends IAxiosResponse {
    data: IAssetTypeStats[];
}

/** Per-category totals across all branches, as returned by `/dashboard-asset-report`. */
export interface IGlobalAssetReport {
    assetTypeName: string;
    totalCount: number;
    lastUpdatedDate: string;
}

export interface IGlobalAssetReportAxiosResponse extends IAxiosResponse {
    data: IGlobalAssetReport[];
}

/**
 * One cell of the branch × category grid, from `/dashboard-asset-report/by-branch`.
 *
 * `branchName` is null for assets not yet assigned to a branch. The backend keeps those rows
 * rather than dropping them so the grid still reconciles with the category totals, which means
 * the UI has to label them rather than assume every asset has a home.
 */
export interface IBranchAssetCell {
    branchName: string | null;
    assetTypeName: string;
    totalCount: number;
}

export interface IBranchAssetCellAxiosResponse extends IAxiosResponse {
    data: IBranchAssetCell[];
}

/**
 * One month of stocking totals. The `month` key is fixed; every other key is a category
 * (camel-cased server-side), so consumers must read the keys rather than assume names —
 * that is what keeps this working as categories are added and renamed.
 */
export type IMonthlyStockRow = { month: string } & Record<string, string | number>;

export interface IMonthlyStockAxiosResponse extends IAxiosResponse {
    data: IMonthlyStockRow[];
}

/** Requested vs delivered for one category over the current year. */
export interface IRequestFulfilment {
    assetType: string;
    totalRequested: number;
    totalDelivered: number;
}

export interface IRequestFulfilmentAxiosResponse extends IAxiosResponse {
    data: IRequestFulfilment[];
}

/** One month of request volume. `quantity` is null for months that have not happened yet. */
export interface IRequestVolumePoint {
    month: string;
    quantity: number | null;
}

export interface IRequestVolumeAxiosResponse extends IAxiosResponse {
    data: IRequestVolumePoint[];
}

/**
 * Legacy shape retained for `RequestContext`, which still types a monthly asset report
 * against the four categories that existed before the category model became configurable.
 * Nothing in the dashboard reads it any more.
 */
export interface IMonthlyAssetReport {
    month: string,
    itEquipment: number,
    officeEquipment: number,
    stationery: number,
    fleet: number
}

export interface IAssetTableData {
    assetName: string;
    engravedNumber?: string | null;
    dateReceived: string;
    assignedTo: string;
    location: string;
}

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { IAxiosResponse } from "../../core/apis/interface";

export interface IDashboardCard {
    image: string;
    number: number;
    name: string;
    stockLevel: string;
    lastUpdated: string
}

export interface IStockIndicatorProps {
    color: string;
}

export interface IStockDetails {
    color: string;
    status: string;
}

export interface IDashboardAssetReport {
    assetTypeName: string,
    totalCount: number,
    lastUpdatedDate: string
}

export interface IDashboardAssetCard {
    name: string,
    image: any,
    stockLevel: string,
    number: number;
    date: string;
}

export interface IDashboardAssetReportAxiosResponse extends IAxiosResponse {
    data: IDashboardAssetReport[]
}

export interface IStationeryReportAxiosResponse extends IAxiosResponse {
    data: IDashboardAssetReport
}


export interface IMonthlyAssetReport {
    month: string,
    itEquipment: number,
    officeEquipment: number,
    stationery: number,
    fleet: number
}

export type BarChartData = {
    label: string;
    data: number[];
    backgroundColor: string;
};


export interface IMonthlyAssetReportAxiosResponse extends IAxiosResponse {
    data: IMonthlyAssetReport[]
}

export interface IAssetTableData {
    assetName: string;
    engravedNumber?: string | null;
    dateReceived: string;
    assignedTo: string;
    location: string;
}
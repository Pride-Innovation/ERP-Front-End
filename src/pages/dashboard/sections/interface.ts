import { string } from "yup";
import { IAxiosResponse } from "../../../core/apis/interface";

interface IRequestRatingStats {
    previousMonth: number;
    currentMonth: number
}

interface IRequestMonthlyStats {
    month: string;
    quantity: number
}

interface IMonthlyItAndOfficeStats {
    month: string;
    itEquipment: number;
    officeEquipment: number
}


interface IRequestRatingStatsAxiosResponse extends IAxiosResponse {
    data: IRequestRatingStats
}

interface IRequestMonthlyStatsAxiosResponse extends IAxiosResponse {
    data: Array<IRequestMonthlyStats>
}


interface IMonthlyItAndOfficeStatsAxiosResponse extends IAxiosResponse {
    data: Array<IMonthlyItAndOfficeStats>
}

interface IMonthlyStationeryTotals {
    commodities: Record<string, number>;
    month: string;
}

interface IMonthlyStationeryTotalsAxiosResponse extends IAxiosResponse {
    data: IMonthlyStationeryTotals
}

export type {
    IRequestRatingStatsAxiosResponse,
    IRequestMonthlyStatsAxiosResponse,
    IRequestMonthlyStats,
    IRequestRatingStats,
    IMonthlyItAndOfficeStatsAxiosResponse,
    IMonthlyItAndOfficeStats,
    IMonthlyStationeryTotalsAxiosResponse,
    IMonthlyStationeryTotals
}
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

interface IMonthlyItAndOfficeSummaryStats {
    assetType: string;
    mostStockedItem: string;
    mostStockedQuantity: number;
    leastStockedItem: string;
    leastStockedQuantity: number;
}

interface IMonthlyItAndOfficeSummaryStatsAxiosResponse extends IAxiosResponse {
    data: Array<IMonthlyItAndOfficeSummaryStats>
}

interface IYearlyRequestSummaryStats {
    assetType: string;
    totalDelivered: number;
    totalRequested: number;
}

interface IYearlyRequestSummaryStatsAxiosResponse extends IAxiosResponse {
    data: Array<IYearlyRequestSummaryStats>
}

interface RequestCardProps {
    title: string;
    value: string;
    completed: string;
    pending: string;
    image: string;
    imageSize: number;
    progressColor: string;
    totalRequested: number;
    totalDelivered: number;
}

export type {
    IRequestRatingStatsAxiosResponse,
    IRequestMonthlyStatsAxiosResponse,
    IRequestMonthlyStats,
    IRequestRatingStats,
    IMonthlyItAndOfficeStatsAxiosResponse,
    IMonthlyItAndOfficeStats,
    IMonthlyStationeryTotalsAxiosResponse,
    IMonthlyStationeryTotals,
    IMonthlyItAndOfficeSummaryStatsAxiosResponse,
    IMonthlyItAndOfficeSummaryStats,
    IYearlyRequestSummaryStatsAxiosResponse,
    IYearlyRequestSummaryStats,
    RequestCardProps
}
import { IAxiosResponse } from "../../../core/apis/interface";

interface IRequestRatingStats {
    previousMonth: number;
    currentMonth: number
}

interface IRequestMonthlyStats {
    month: string;
    quantity: number
}


interface IRequestRatingStatsAxiosResponse extends IAxiosResponse {
    data: IRequestRatingStats
}

interface IRequestMonthlyStatsAxiosResponse extends IAxiosResponse {
    data: Array<IRequestMonthlyStats>
}

export type {
    IRequestRatingStatsAxiosResponse,
    IRequestMonthlyStatsAxiosResponse,
    IRequestMonthlyStats,
    IRequestRatingStats
}
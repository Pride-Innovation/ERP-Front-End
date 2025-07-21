import { IAxiosResponse } from "../../../core/apis/interface";

interface IRequestRatingStats {
    previousMonth: number;
    currentMonth: number
}

interface IRequestRatingStatsAxiosResponse extends IAxiosResponse {
    data: IRequestRatingStats
}

export type {
    IRequestRatingStatsAxiosResponse
}
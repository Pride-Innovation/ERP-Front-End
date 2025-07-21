import axiosInstance from "../../../../core/apis/axiosInstance";

export const requestRatingVariationService = async () => {

    try {
        const response = await axiosInstance.get('/request-rating-stats');
        return response;
    } catch (error) {
        return error;
    }
}

export const resquestStatsOneYearService = async () => {
    try {
        const response = await axiosInstance.get('/request-stats-one-year');
        return response;
    } catch (error) {
        return error;
    }
}
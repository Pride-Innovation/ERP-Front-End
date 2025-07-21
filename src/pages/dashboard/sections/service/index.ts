import axiosInstance from "../../../../core/apis/axiosInstance";

export const requestRatingStatsService = async () => {

    try {
        const response = await axiosInstance.get('/request-rating-stats');
        return response;
    } catch (error) {
        return error;
    }
}
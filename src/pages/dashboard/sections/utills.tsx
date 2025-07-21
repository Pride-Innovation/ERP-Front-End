import { useContext } from "react";
import {
    IRequestMonthlyStats,
    IRequestMonthlyStatsAxiosResponse,
    IRequestRatingStatsAxiosResponse
} from "./interface";
import { requestRatingVariationService, resquestStatsOneYearService } from "./service";
import { DashboardContext } from "../../../context/dashboard";

const SectionUtills = () => {
    const {
        setRequestRatings,
        setRequestRatingStatsLabels,
        setRequestVariationStats
    } = useContext(DashboardContext);

    /**
     * Sets the ratings and labels for request ratings.
     * @param ratings - Array of monthly stats containing month and quantity.
     */
    const setRatings = (ratings: Array<IRequestMonthlyStats>) => {
        setRequestRatings(() => ratings.map((rating) => rating.quantity));
        setRequestRatingStatsLabels(() => ratings.map((rating) => rating.month.slice(0, 3)));
    }

    /**
     * Fetches the request rating stats for the current month and previous month.
     * Updates the context with the new ratings.
     */
    const requestRatingStatsFxn = async () => {
        try {
            const response = await resquestStatsOneYearService() as IRequestMonthlyStatsAxiosResponse;
            if (response.status === 200) {
                setRatings(response.data);
            }
        } catch (error) {
            console.error("Error fetching request rating stats:", error);
        }
    }

    const requestRatingVariationFxn = async () => {
        try {
            const response = await requestRatingVariationService() as IRequestRatingStatsAxiosResponse;
            if (response.status === 200) {
                setRequestVariationStats(response.data);
            }
        }
        catch (error) {
            console.error("Error fetching request rating variation:", error);
        }
    }


    return ({
        requestRatingStatsFxn,
        requestRatingVariationFxn
    });
}

export default SectionUtills
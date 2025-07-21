import { useContext } from "react";
import {
    IMonthlyItAndOfficeStats,
    IMonthlyItAndOfficeStatsAxiosResponse,
    IRequestMonthlyStats,
    IRequestMonthlyStatsAxiosResponse,
    IRequestRatingStatsAxiosResponse
} from "./interface";
import {
    getMonthlyItAndOfficeStatsService,
    requestRatingVariationService,
    resquestStatsOneYearService
} from "./service";
import { DashboardContext } from "../../../context/dashboard";

const SectionUtills = () => {
    const {
        setRequestRatings,
        setRequestRatingStatsLabels,
        setRequestVariationStats,
        setMonthlyItStats,
        setMonthlyOfficeStats,
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

    /**
     * Sets the asset stock review for IT and Office equipment.
     * @param stats - Array of monthly stats containing IT and Office equipment quantities.
     */
    const setAssetStockReview = (stats: Array<IMonthlyItAndOfficeStats>) => {
        setMonthlyItStats(() => stats.map((stat) => stat.itEquipment));
        setMonthlyOfficeStats(() => stats.map((stat) => stat.officeEquipment));
        setRequestRatingStatsLabels(() => stats.map((stat) => stat.month.slice(0, 3)));
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

    const getMonthlyItAndOfficeStatsFxn = async () => {
        try {
            const response = await getMonthlyItAndOfficeStatsService() as IMonthlyItAndOfficeStatsAxiosResponse;
            if (response.status === 200) {
                setAssetStockReview(response.data);
            }
        }
        catch (error) {
            console.error("Error fetching request rating variation:", error);
        }
    }


    return ({
        requestRatingStatsFxn,
        requestRatingVariationFxn,
        getMonthlyItAndOfficeStatsFxn
    });
}

export default SectionUtills
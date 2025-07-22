import { useContext } from "react";
import {
    IMonthlyItAndOfficeStats,
    IMonthlyItAndOfficeStatsAxiosResponse,
    IMonthlyStationeryTotals,
    IMonthlyStationeryTotalsAxiosResponse,
    IRequestMonthlyStats,
    IRequestMonthlyStatsAxiosResponse,
    IRequestRatingStatsAxiosResponse
} from "./interface";
import {
    getMonthlyItAndOfficeStatsService,
    getMonthlyStationeryTotalsService,
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
        setMonthlyStationeryStats,
        setMonthlyStationeryStatslabels
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

    /**
     * Processes the API response to return two arrays:
     * 1. Specific commodities: ['Book', 'Pens', 'Loan Forms']
     * 2. An "Others" category that sums all remaining commodities
     */
    const setDoughnutChartData = (data: IMonthlyStationeryTotals) => {
        const keysOfInterest = ['Books', 'Pens', 'Loan Forms'];

        const names: string[] = [];
        const values: number[] = [];

        let othersSum = 0;

        for (const [key, value] of Object.entries(data.commodities)) {
            if (keysOfInterest.includes(key)) {
                names.push(key);
                values.push(value);
            } else {
                othersSum += value;
            }
        }

        if (othersSum > 0) {
            names.push('Others');
            values.push(othersSum);
        }

        const map = new Map(names.map((n, i) => [n, values[i]]));
        const orderedNames = [...keysOfInterest, 'Others'].filter(name => map.has(name));
        const orderedValues = orderedNames.map(name => map.get(name)!);

        setMonthlyStationeryStats(orderedValues);
        setMonthlyStationeryStatslabels(orderedNames);

    }


    const getMonthlyStationeryTotals = async () => {
        try {
            const response = await getMonthlyStationeryTotalsService() as IMonthlyStationeryTotalsAxiosResponse;
            if (response.status === 200) {
                console.log("Response data:", response.data);
                setDoughnutChartData(response.data);
            }
        }
        catch (error) {
            console.error("Error fetching request rating variation:", error);
        }
    }


    return ({
        requestRatingStatsFxn,
        requestRatingVariationFxn,
        getMonthlyItAndOfficeStatsFxn,
        getMonthlyStationeryTotals
    });
}

export default SectionUtills
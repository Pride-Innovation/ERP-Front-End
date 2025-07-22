import { useContext } from "react";
import {
    IMonthlyItAndOfficeStats,
    IMonthlyItAndOfficeStatsAxiosResponse,
    IMonthlyItAndOfficeSummaryStatsAxiosResponse,
    IMonthlyStationeryTotals,
    IMonthlyStationeryTotalsAxiosResponse,
    IRequestMonthlyStats,
    IRequestMonthlyStatsAxiosResponse,
    IRequestRatingStatsAxiosResponse,
    IYearlyRequestSummaryStats,
    IYearlyRequestSummaryStatsAxiosResponse,
    RequestCardProps
} from "./interface";
import {
    getCurrentYearRequestSummaryService,
    getItAndOfficeMonthlyStockSummaryService,
    getMonthlyItAndOfficeStatsService,
    getMonthlyStationeryTotalsService,
    requestRatingVariationService,
    resquestStatsOneYearService
} from "./service";
import { DashboardContext } from "../../../context/dashboard";
import { formatNumber } from "../../../utils/helpers";
import furnitureImage from "../../../statics/images/furnitureDesktop.png";
import stationeryImage from "../../../statics/images/stationeryDesktop.png";
import RequestImage from "../../../statics/images/requestDesktop.png"

const SectionUtills = () => {
    const {
        setRequestRatings,
        setRequestRatingStatsLabels,
        setRequestVariationStats,
        setMonthlyItStats,
        setMonthlyOfficeStats,
        setMonthlyStationeryStats,
        setMonthlyStationeryStatslabels,
        setMonthlyITandOfficeSummaryStats,
        setYearlyRequestSummaryStats
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


    const getItAndOfficeMonthlyStockSummaryFxn = async () => {
        try {
            const response = await getItAndOfficeMonthlyStockSummaryService() as IMonthlyItAndOfficeSummaryStatsAxiosResponse;
            if (response.status === 200) {
                setMonthlyITandOfficeSummaryStats(response.data);
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
                setDoughnutChartData(response.data);
            }
        }
        catch (error) {
            console.error("Error fetching request rating variation:", error);
        }
    }


    /**
     * 
     * @param apiData - Array of IYearlyRequestSummaryStats from the API response.
     * * Maps the API data to an array of RequestCardProps for rendering in the UI.
     * * Each card represents a different asset type (IT Equipment, Office Equipment, Stationery).
     * 
     * @returns 
     */
    const mapApiDataToCardData = (apiData: Array<IYearlyRequestSummaryStats>): RequestCardProps[] => {

        const dataMap = apiData.reduce((acc, cur) => {
            acc[cur.assetType.toLowerCase()] = cur;
            return acc;
        }, {} as Record<string, { totalRequested: number; totalDelivered: number }>);

        return [
            {
                title: "IT Asset Requests",
                image: RequestImage,
                imageSize: 40,
                value: formatNumber(dataMap['it equipment']?.totalRequested ?? 0),
                completed: formatNumber(dataMap['it equipment']?.totalDelivered ?? 0),
                pending: formatNumber((dataMap['it equipment']?.totalRequested ?? 0) - (dataMap['it equipment']?.totalDelivered ?? 0)),
                progressColor: "#1976d2",
                totalRequested: dataMap['it equipment']?.totalRequested ?? 0,
                totalDelivered: dataMap['it equipment']?.totalDelivered ?? 0
            },
            {
                title: "Office Asset Requests",
                image: furnitureImage,
                imageSize: 60,
                value: formatNumber(dataMap['office equipment']?.totalRequested ?? 0),
                completed: formatNumber(dataMap['office equipment']?.totalDelivered ?? 0),
                pending: formatNumber((dataMap['office equipment']?.totalRequested ?? 0) - (dataMap['office equipment']?.totalDelivered ?? 0)),
                progressColor: "#ab47bc",
                totalRequested: dataMap['office equipment']?.totalRequested ?? 0,
                totalDelivered: dataMap['office equipment']?.totalDelivered ?? 0
            },
            {
                title: "Stationery Requests",
                image: stationeryImage,
                imageSize: 40,
                value: formatNumber(dataMap['stationery']?.totalRequested ?? 0),
                completed: formatNumber(dataMap['stationery']?.totalDelivered ?? 0),
                pending: formatNumber((dataMap['stationery']?.totalRequested ?? 0) - (dataMap['stationery']?.totalDelivered ?? 0)),
                progressColor: "secondary.main",
                totalRequested: dataMap['stationery']?.totalRequested ?? 0,
                totalDelivered: dataMap['stationery']?.totalDelivered ?? 0
            },
        ];
    };

    const getCurrentYearRequestSummary = async () => {
        try {
            const response = await getCurrentYearRequestSummaryService() as IYearlyRequestSummaryStatsAxiosResponse;
            if (response.status === 200) {
                console.log(mapApiDataToCardData(response.data), "filtered data")
                setYearlyRequestSummaryStats(mapApiDataToCardData(response.data));
            }
        }
        catch (error) {
            console.error("Error fetching current year request summary:", error);
        }
    }


    return ({
        requestRatingStatsFxn,
        requestRatingVariationFxn,
        getMonthlyItAndOfficeStatsFxn,
        getMonthlyStationeryTotals,
        getItAndOfficeMonthlyStockSummaryFxn,
        getCurrentYearRequestSummary
    });
}

export default SectionUtills
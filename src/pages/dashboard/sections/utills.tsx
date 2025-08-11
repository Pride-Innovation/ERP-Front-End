import { useContext, useState } from "react";
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
    fetchBranchAssetStaticsService,
    findLatestPendingRequestsWithDetailsService,
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
import { BranchAssetStats, IBranchAssetStatics, IBranchAssetStaticsAxiosResponse, IRequestsAxiosResponse } from "../../request/interface";

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
        setYearlyRequestSummaryStats,
        setLatestPendingRequests,
        setAssetStats
    } = useContext(DashboardContext);

    /**
     * Sets the ratings and labels for request ratings.
     * @param ratings - Array of monthly stats containing month and quantity.
     */
    const setRatings = (ratings: Array<IRequestMonthlyStats>) => {
        if (!ratings || ratings.length === 0) {
            return;
        }
        setRequestRatings(() => ratings.map((rating) => rating.quantity));
        setRequestRatingStatsLabels(() => ratings.map((rating) => rating.month.slice(0, 3)));
    }

    function fillAndTrimMonthsForLineGraph(data: IRequestMonthlyStats[]): IRequestMonthlyStats[] {
        const allMonths = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const currentMonthIndex = new Date().getMonth();

        const dataMap = new Map(data.map(item => [item.month, item.quantity]));

        return allMonths.map((month, index) => ({
            month,
            quantity: index <= currentMonthIndex
                ? dataMap.get(month) ?? 0
                : null
        }));
    }

    /**
     * Fetches the request rating stats for the current month and previous month.
     * Updates the context with the new ratings.
     */
    const requestRatingStatsFxn = async () => {
        try {
            const response = await resquestStatsOneYearService() as IRequestMonthlyStatsAxiosResponse;
            if (response.status === 200) {
                setRatings(fillAndTrimMonthsForLineGraph(response.data));
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

    function fillMissingMonths(data: IMonthlyItAndOfficeStats[]): IMonthlyItAndOfficeStats[] {
        const allMonths = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const dataMap = new Map(data.map(item => [item.month, item]));

        return allMonths.map(month => {
            return dataMap.get(month) || {
                month,
                itEquipment: 0,
                officeEquipment: 0
            };
        });
    }

    const getMonthlyItAndOfficeStatsFxn = async () => {
        try {
            const response = await getMonthlyItAndOfficeStatsService() as IMonthlyItAndOfficeStatsAxiosResponse;
            if (response.status === 200) {
                setAssetStockReview(fillMissingMonths(response.data));
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

        const seenKeys = new Set<string>();

        for (const [key, value] of Object.entries(data.commodities)) {
            if (keysOfInterest.includes(key)) {
                seenKeys.add(key);
            } else {
                othersSum += value;
            }
        }

        for (const key of keysOfInterest) {
            const value = data.commodities[key] ?? 0;
            names.push(key);
            values.push(value);
        }

        names.push('Others');
        values.push(othersSum);

        setMonthlyStationeryStats(values);
        setMonthlyStationeryStatslabels(names);
    };



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
                setYearlyRequestSummaryStats(mapApiDataToCardData(response.data));
            }
        }
        catch (error) {
            console.error("Error fetching current year request summary:", error);
        }
    }

    const findLatestPendingRequestsWithDetails = async () => {
        try {
            const response = await findLatestPendingRequestsWithDetailsService() as IRequestsAxiosResponse;
            if (response.status === 200) {
                setLatestPendingRequests(response.data.content);
            }
        } catch (error) {
            console.error("Error fetching latest pending requests:", error);
        }
    }

    // Formats the branch asset statistics data for easier access
    const formatBranchAssetStatistics = (data: IBranchAssetStatics[]) => {
        const res = data.reduce((acc: Record<string, Omit<IBranchAssetStatics, 'assetType'>>, item) => {
            const { assetType, ...stats } = item;
            acc[(assetType.split(' ').join('').toLowerCase())] = stats;
            return acc;
        }, {} as Record<string, Omit<IBranchAssetStatics, 'assetType'>>);


        return res;

    };

    const fetchBranchAssetStatics = async () => {
        try {
            const response = await fetchBranchAssetStaticsService() as IBranchAssetStaticsAxiosResponse;
            if (response.status === 200) {
                setAssetStats(formatBranchAssetStatistics(response.data) as unknown as BranchAssetStats);
            }
        } catch (error) {
            console.error("Error fetching branch asset statistics:", error);
        }
    }


    return ({
        requestRatingStatsFxn,
        requestRatingVariationFxn,
        getMonthlyItAndOfficeStatsFxn,
        getMonthlyStationeryTotals,
        getItAndOfficeMonthlyStockSummaryFxn,
        getCurrentYearRequestSummary,
        findLatestPendingRequestsWithDetails,
        fetchBranchAssetStatics
    });
}

export default SectionUtills
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
    fetchBranchAssetStaticsService,
    fetchPersonalAssetReportService,
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
import {
    AssetDomain,
    BranchAssetStats,
    IBranchAssetStatics,
    IBranchAssetStaticsAxiosResponse,
    IPersonalAssetReport,
    IPersonalAssetReportAxiosResponse,
    IRequestsAxiosResponse
} from "../../request/interface";

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
        setAssetStats,
        setAssetDomain
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


    // Config for well-known asset types; unknown types get sensible defaults.
    const KNOWN_CARD_CONFIG: Record<string, { title: string; image: string; imageSize: number; progressColor: string }> = {
        'it equipment': { title: 'IT Asset Requests', image: RequestImage, imageSize: 40, progressColor: '#1976d2' },
        'office equipment': { title: 'Office Asset Requests', image: furnitureImage, imageSize: 60, progressColor: '#ab47bc' },
        'stationery': { title: 'Stationery Requests', image: stationeryImage, imageSize: 40, progressColor: '#BC892C' },
        'fleet': { title: 'Fleet Requests', image: RequestImage, imageSize: 40, progressColor: '#445069' },
    };

    const CARD_COLORS = ['#1976d2', '#ab47bc', '#BC892C', '#445069', '#2e7d32', '#f59300', '#e53935'];

    const mapApiDataToCardData = (apiData: Array<IYearlyRequestSummaryStats>): RequestCardProps[] => {
        return apiData.map((item, index) => {
            const key = item.assetType.toLowerCase();
            const config = KNOWN_CARD_CONFIG[key] ?? {
                title: `${item.assetType} Requests`,
                image: RequestImage,
                imageSize: 40,
                progressColor: CARD_COLORS[index % CARD_COLORS.length],
            };
            return {
                ...config,
                value: formatNumber(item.totalRequested),
                completed: formatNumber(item.totalDelivered),
                pending: formatNumber(item.totalRequested - item.totalDelivered),
                totalRequested: item.totalRequested,
                totalDelivered: item.totalDelivered,
            };
        });
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

    // Formats the branch asset statistics data for easier access.
    // Keeps the original assetType string as `label` so components can display it.
    const formatBranchAssetStatistics = (data: IBranchAssetStatics[]) => {
        return data.reduce((acc: Record<string, Omit<IBranchAssetStatics, 'assetType'> & { label: string }>, item) => {
            const { assetType, ...stats } = item;
            acc[assetType.split(' ').join('').toLowerCase()] = { ...stats, label: assetType };
            return acc;
        }, {});
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


    function transformApiData(data: IPersonalAssetReport[]): AssetDomain[] {
        const getPlanLabel = (type: string): string => {
            const t = type.toLowerCase();
            if (t.includes('it') || t.includes('tech') || t.includes('computer')) return 'Hardware Assets';
            if (t.includes('office') || t.includes('furniture') || t.includes('chair')) return 'Workspace Assets';
            if (t.includes('fleet') || t.includes('vehicle') || t.includes('car')) return 'Fleet Assets';
            return 'General Assets';
        };

        return data.map((group, index) => {
            const availableCount = group.assets.filter(
                asset => asset.status.toLowerCase() !== "maintenance"
            ).length;

            const subDomains = group.assets.map(asset => ({
                id: asset.id,
                name: asset.name,
                type: asset.status,
                serial: asset.serialNumber,
                engravingNumber: asset.engravingNumber,
                status: asset.status.toLowerCase() !== "maintenance" ? "Active" : "Inactive",
            }));

            return {
                id: index + 1,
                domain: group.type,
                plan: getPlanLabel(group.type),
                totalItems: group.totalItems,
                available: availableCount,
                domains: group.assets.length,
                status: "Available",
                subDomains
            };
        });
    }

    const fetchPersonalAssetReport = async () => {
        try {
            const response = await fetchPersonalAssetReportService() as IPersonalAssetReportAxiosResponse;
            if (response.status === 200) {
                const data = transformApiData(response.data);
                setAssetDomain(data);
            }
        } catch (error) {
            console.error("Error fetching personal asset report:", error);
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
        fetchBranchAssetStatics,
        fetchPersonalAssetReport
    });
}

export default SectionUtills
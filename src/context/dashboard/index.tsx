import {
    createContext,
    Dispatch,
    FC,
    useState
} from "react";
import {
    IMonthlyItAndOfficeSummaryStats,
    IRequestRatingStats,
    RequestCardProps
} from "../../pages/dashboard/sections/interface";
import { BranchAssetStats, IRequest } from "../../pages/request/interface";


interface DashboardContextProps {
    requestRatingStats: Array<number | null>;
    setRequestRatings: Dispatch<React.SetStateAction<Array<number | null>>>;
    requestRatingStatsLabels: Array<string>;
    setRequestRatingStatsLabels: Dispatch<React.SetStateAction<Array<string>>>;
    requestVariationStats: IRequestRatingStats;
    setRequestVariationStats: Dispatch<React.SetStateAction<IRequestRatingStats>>;
    monthlyItStats: Array<number>;
    setMonthlyItStats: Dispatch<React.SetStateAction<Array<number>>>;
    monthlyOfficeStats: Array<number>;
    setMonthlyOfficeStats: Dispatch<React.SetStateAction<Array<number>>>;
    monthlyItAndOfficeStatslabels: Array<string>;
    setMonthlyItAndOfficeStatslabels: Dispatch<React.SetStateAction<Array<string>>>;

    monthlyStationeryStats: Array<number>;
    setMonthlyStationeryStats: Dispatch<React.SetStateAction<Array<number>>>;
    monthlyStationeryStatslabels: Array<string>;
    setMonthlyStationeryStatslabels: Dispatch<React.SetStateAction<Array<string>>>;
    monthlyITandOfficeSummaryStats: Array<IMonthlyItAndOfficeSummaryStats>;
    setMonthlyITandOfficeSummaryStats: Dispatch<React.SetStateAction<Array<IMonthlyItAndOfficeSummaryStats>>>;
    yearlyRequestSummaryStats: Array<RequestCardProps>;
    setYearlyRequestSummaryStats: Dispatch<React.SetStateAction<Array<RequestCardProps>>>;
    latestPendingRequests: Array<IRequest>;
    setLatestPendingRequests: Dispatch<React.SetStateAction<Array<IRequest>>>;
    assetStats: BranchAssetStats;
    setAssetStats: Dispatch<React.SetStateAction<BranchAssetStats>>;
}

export const DashboardContext = createContext({} as DashboardContextProps);

const DashboardProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [requestRatingStats, setRequestRatings] = useState<Array<number | null>>([
        3.2, 3.4, 3.3, 3.6, 3.7, 3.5, 3.6, 3.8, 3.9, 4.0, 4.0, 4.0]);
    const [requestRatingStatsLabels, setRequestRatingStatsLabels] = useState<Array<string>>([
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
    const [requestVariationStats, setRequestVariationStats] = useState<IRequestRatingStats>({
        previousMonth: 3.5,
        currentMonth: 4.0
    });
    const [monthlyItStats, setMonthlyItStats] = useState<Array<number>>([0]);
    const [monthlyOfficeStats, setMonthlyOfficeStats] = useState<Array<number>>([0]);
    const [monthlyItAndOfficeStatslabels, setMonthlyItAndOfficeStatslabels] = useState<Array<string>>(
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
    const [monthlyStationeryStats, setMonthlyStationeryStats] = useState<Array<number>>([0]);
    const [monthlyStationeryStatslabels, setMonthlyStationeryStatslabels] = useState<Array<string>>(
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
    const [monthlyITandOfficeSummaryStats, setMonthlyITandOfficeSummaryStats] = useState<Array<IMonthlyItAndOfficeSummaryStats>>([]);
    const [yearlyRequestSummaryStats, setYearlyRequestSummaryStats] = useState<Array<RequestCardProps>>([]);
    const [latestPendingRequests, setLatestPendingRequests] = useState<Array<IRequest>>([]);
    const [assetStats, setAssetStats] = useState<BranchAssetStats>({} as BranchAssetStats);

    return (
        <DashboardContext.Provider value={{
            requestRatingStats,
            setRequestRatings,
            requestRatingStatsLabels,
            setRequestRatingStatsLabels,
            requestVariationStats,
            setRequestVariationStats,
            monthlyItStats,
            setMonthlyItStats,
            monthlyOfficeStats,
            setMonthlyOfficeStats,
            monthlyItAndOfficeStatslabels,
            setMonthlyItAndOfficeStatslabels,
            monthlyStationeryStats,
            setMonthlyStationeryStats,
            monthlyStationeryStatslabels,
            setMonthlyStationeryStatslabels,
            monthlyITandOfficeSummaryStats,
            setMonthlyITandOfficeSummaryStats,
            yearlyRequestSummaryStats,
            setYearlyRequestSummaryStats,
            latestPendingRequests,
            setLatestPendingRequests,
            assetStats,
            setAssetStats
        }}>
            {children}
        </DashboardContext.Provider>
    );
}

export default DashboardProvider;
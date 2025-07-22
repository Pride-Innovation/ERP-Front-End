import {
    createContext,
    Dispatch,
    FC,
    useState
} from "react";
import { IRequestRatingStats } from "../../pages/dashboard/sections/interface";


interface DashboardContextProps {
    requestRatingStats: Array<number>;
    setRequestRatings: Dispatch<React.SetStateAction<Array<number>>>;
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
}

export const DashboardContext = createContext({} as DashboardContextProps);

const DashboardProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [requestRatingStats, setRequestRatings] = useState<Array<number>>([
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
            setMonthlyStationeryStatslabels
        }}>
            {children}
        </DashboardContext.Provider>
    );
}

export default DashboardProvider;
import axiosInstance from "../../../core/apis/axiosInstance";

export const fetchDashboardAssetReportService = async () => {
    try {
        const response = axiosInstance.get("dashboard-asset-report");
        return response;
    } catch (error) {
        return error;
    }
}


export const fetchStationeryDataReportService = async () => {
    try {
        const response = axiosInstance.get("stationery-report");
        return response;
    } catch (error) {
        return error;
    }
}
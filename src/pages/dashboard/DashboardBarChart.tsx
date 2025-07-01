/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ChartData, ChartOptions } from "chart.js";
import { useContext, useEffect, useState } from "react";
import BarChartUtills from "../../components/charts/barChartUtills";
import BarChart from "../../components/charts/BarChart";
import DashBoardUtills from "./utills";
import { RequestContext } from "../../context/request/RequestContext";
import { BarChartData } from "./interface";

const DashboardBarChart = () => {
    const { barChartOptions, barChartData } = BarChartUtills();
    const { fetchMonthlyStockingReport, transformToBarChartData } = DashBoardUtills()
    const { monthlyStockingReport } = useContext(RequestContext);

    const [assetBarChartOptions, setAssetBarChartOptions] = useState<ChartOptions<'bar'>>(barChartOptions);
    const [assetBarChartData, setAssetBarChartData] = useState<ChartData<'bar'>>(barChartData);
    const [barChartDataList, setBarChatDataList] = useState<BarChartData[]>([] as BarChartData[])

    const updateAssetBarChartInfo = () => {
        setAssetBarChartOptions({
            ...barChartOptions,
            plugins: {
                ...barChartOptions.plugins,
                title: {
                    ...barChartOptions.plugins.title,
                    text: 'STOCK HISTORY (LAST 8 MONTHS)',
                    font: { size: 14 }
                }
            }
        });

        setAssetBarChartData({
            ...barChartData,
            datasets: barChartDataList
        });
    }

    useEffect(() => {
        fetchMonthlyStockingReport()
    }, []);

    useEffect(() => {
        updateAssetBarChartInfo();
    }, [barChartDataList])

    useEffect(() => {
        if (monthlyStockingReport.length > 0) {
            setBarChatDataList(transformToBarChartData(monthlyStockingReport))
        }
    }, [monthlyStockingReport])


    return (
        <BarChart data={assetBarChartData} options={assetBarChartOptions} />
    )
}

export default DashboardBarChart;
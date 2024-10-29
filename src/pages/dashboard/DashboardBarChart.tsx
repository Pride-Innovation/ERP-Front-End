import { ChartData, ChartOptions } from "chart.js";
import { useEffect, useState } from "react";
import BarChartUtills from "../../components/charts/barChartUtills";
import BarChart from "../../components/charts/BarChart";

const DashboardBarChart = () => {
    const { barChartOptions, barChartData } = BarChartUtills();

    const [assetBarChartOptions, setAssetBarChartOptions] = useState<ChartOptions<'bar'>>(barChartOptions);
    const [assetBarChartData, setAssetBarChartData] = useState<ChartData<'bar'>>(barChartData);

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

        setAssetBarChartData({ ...barChartData });
    }

    useEffect(() => {
        updateAssetBarChartInfo();
    }, []);


    return (
        <BarChart data={assetBarChartData} options={assetBarChartOptions} />
    )
}

export default DashboardBarChart;
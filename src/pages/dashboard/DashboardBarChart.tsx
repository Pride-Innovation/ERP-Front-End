import { ChartData, ChartOptions } from "chart.js";
import { useEffect, useState } from "react";
import BarChartUtills from "../../components/charts/barChartUtills";
import BarChart from "../../components/charts/BarChart";

const DashboardBarChart = () => {
    const { barChartOptions, barChartData } = BarChartUtills();

    const [agentBarChartOptions, setAgentBarChartOptions] = useState<ChartOptions<'bar'>>(barChartOptions);
    const [agentBarChartData, setAgentBarChartData] = useState<ChartData<'bar'>>(barChartData);

    const updateAgentBarChartInfo = () => {
        setAgentBarChartOptions({
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

        setAgentBarChartData({ ...barChartData });
    }

    useEffect(() => {
        updateAgentBarChartInfo();
    }, []);


    return (
        <BarChart data={agentBarChartData} options={agentBarChartOptions} />
    )
}

export default DashboardBarChart;
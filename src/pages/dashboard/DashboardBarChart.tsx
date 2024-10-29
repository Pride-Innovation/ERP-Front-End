import { ChartData, ChartOptions } from "chart.js";
import { useEffect, useState } from "react";
import { IBarChartKeyTable } from "../../components/charts/interface";
import BarChartUtills from "../../components/charts/barChartUtills";
import BarChart from "../../components/charts/BarChart";

const DashboardBarChart = () => {
    const { barChartOptions, barChartData, barChartKeyTable, createKeyTableData, weeklyOpeningStockMock } = BarChartUtills();

    const [agentBarChartOptions, setAgentBarChartOptions] = useState<ChartOptions<'bar'>>(barChartOptions);
    const [agentBarChartData, setAgentBarChartData] = useState<ChartData<'bar'>>(barChartData);
    // const [agentBarChartKeyTable, setAgentBarChartKeyTable] = useState<Array<IBarChartKeyTable>>(barChartKeyTable);

    const updateAgentBarChartInfo = () => {
        setAgentBarChartOptions({
            ...barChartOptions,
            plugins: {
                ...barChartOptions.plugins,
                title: {
                    ...barChartOptions.plugins.title,
                    text: 'Stock History (Last Seven Days)',
                }
            }
        });

        setAgentBarChartData({ ...barChartData });
    }


    useEffect(() => {
        const data = createKeyTableData(weeklyOpeningStockMock);
        // setAgentBarChartKeyTable(data);
        updateAgentBarChartInfo();
    }, []);


    return (
        <BarChart data={agentBarChartData} options={agentBarChartOptions} />
    )
}

export default DashboardBarChart
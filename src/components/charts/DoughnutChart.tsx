import {
    useEffect,
    useState
} from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Spinner from '../Spinner';
import { IDoughnutChart } from './interface';
import DoughnutChartUtills from './doughnutChartUtills';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function DoughnutChart({
    loading,
    title,
    labels,
    headerText,
    chartData,
    spacing = 2,
    cutout = "5%",
    backgroundColor,
    borderColor,
    height = 500,
    keys = true,
    radius = '75%',
    maintainAspectRatio = false,
    position = "top"
}: IDoughnutChart) {
    const { data, options } = DoughnutChartUtills();
    const [formattedData, setFormattedData] = useState<{
        labels: Array<string>;
        datasets: Array<{
            label: string,
            data: Array<number>,
            backgroundColor: Array<string>,
            borderColor: Array<string>,
            borderWidth: number,
            spacing: number,
            cutout: string,
            radius: string
        }>
    }>(data)
    const [formatedOptions, setFormattedOptions] = useState<{
        responsive: boolean,
        maintainAspectRatio: boolean,
        plugins: {
            title: {
                display: boolean,
                text: string,
                font: { size: number }
            },
            legend: {
                display: boolean,
                position: any
            },
        },
    }>(options)

    useEffect(() => {
        setFormattedData({
            ...data,
            labels: labels,
            datasets: [
                {
                    ...data.datasets[0],
                    borderColor: borderColor ? borderColor : data.datasets[0].borderColor,
                    backgroundColor: backgroundColor ? backgroundColor : data.datasets[0].backgroundColor,
                    label: headerText,
                    data: chartData,
                    spacing: spacing,
                    cutout: cutout,
                    radius,
                }
            ],

        });
        setFormattedOptions({
            ...options,
            maintainAspectRatio,
            plugins: {
                title: {
                    ...options.plugins.title,
                    text: title
                },
                legend: {
                    display: keys,
                    position
                },
            }
        })
    }, [])

    return loading ? <Spinner /> :
        <Doughnut height={height} options={formatedOptions} data={formattedData} />;
}

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
import { blue, green, orange } from '@mui/material/colors';
import Spinner from '../Spinner';

ChartJS.register(ArcElement, Tooltip, Legend, Title);
const colors = [blue[900], green[900], orange[900], blue[300], blue[100]]

export const data = {
    labels: [
        "Asset 1",
        "Asset 2",
        "Asset 3",
        "Asset 4",
        "Asset 5",
    ],
    datasets: [
        {
            label: '% of Assets',
            data: [6, 7, 4, 5, 8],
            backgroundColor: [...colors],
            borderColor: [...colors],
            borderWidth: 0,
            spacing: 5,
            radius: '75%',
            cutout: '10%'
        },
    ],
};

export const options = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
        title: {
            display: true,
            text: 'ASSETS IN STORE',
            font: { size: 14 }
        },
        legend: {
            display: true,
            position: 'top' as const,
        },
    },
};

interface IDoughnutChart {
    loading: boolean;
    title: string;
    labels: Array<string>;
    headerText: string;
    chartData: Array<number>
    spacing?: number;
    cutout?: string;
    backgroundColor?: Array<string>;
    borderColor?: Array<string>
    height?: number
    keys?: boolean;
    position?: 'top' | 'left' | 'right' | 'bottom' | 'center' | 'chartArea';
    radius?: string
    maintainAspectRatio?: boolean
}

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

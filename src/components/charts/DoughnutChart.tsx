/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation 
for any purpose is prohibited unless authorized in writing by the Managing Director
*/

import { useMemo } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Doughnut } from 'react-chartjs-2';
import Spinner from '../Spinner';
import { IDoughnutChart } from './interface';
import DoughnutChartUtills from './doughnutChartUtills';

ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

export default function DoughnutChart({
    loading,
    title,
    labels,
    headerText,
    chartData,
    spacing = 2,
    cutout = '5%',
    backgroundColor,
    borderColor,
    height = 500,
    keys = true,
    radius = '75%',
    maintainAspectRatio = false,
    position = 'top'
}: IDoughnutChart) {
    const { data: baseData, options: baseOptions } = DoughnutChartUtills();

    const formattedData = useMemo(() => ({
        labels,
        datasets: [
            {
                ...baseData.datasets[0],
                label: headerText,
                data: chartData,
                spacing,
                cutout,
                radius,
                backgroundColor: backgroundColor || [
                    '#08796C', // IT Equipment
                    '#BC892C', // Office Equipment
                    '#000074', // Fleet
                    '#ACD1D1'  // Stationery
                ],
                borderColor: borderColor || ['#ffffff'],
            }
        ]
    }), [labels, chartData, backgroundColor, borderColor, spacing, cutout, radius, headerText]);

    const formattedOptions = useMemo(() => ({
        ...baseOptions,
        maintainAspectRatio,
        plugins: {
            ...baseOptions.plugins,
            title: {
                ...baseOptions.plugins.title,
                display: !!title,
                text: title,
                font: { size: 16 }
            },
            legend: {
                display: keys,
                position
            },
            datalabels: {
                color: '#ffffff',
                formatter: (value: number, context: any) => {
                    const dataset = context.chart.data.datasets[0];
                    const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return `${percentage}%`;
                },
                font: {
                    weight: 'bold' as const,
                    size: 14
                }
            }
        }
    }), [baseOptions, maintainAspectRatio, title, keys, position]);

    return loading ? <Spinner /> : (
        <Doughnut height={height} options={formattedOptions} data={formattedData} />
    );
}

/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { IBarChartProps } from './interface';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function BarChart({ data, options }: IBarChartProps) {
    return (
        <Bar
            style={{ minHeight: 500, padding: 16 }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 13,
                                weight: 500,
                            },
                            color: '#333',
                            boxWidth: 12,
                        },
                    },
                    title: {
                        display: true,
                        text: 'Assets Overview',
                        font: {
                            size: 18,
                            weight: 'bold',
                        },
                        color: '#222',
                        padding: {
                            bottom: 20,
                        },
                    },
                    tooltip: {
                        backgroundColor: '#fff',
                        titleColor: '#000',
                        bodyColor: '#444',
                        borderColor: '#ddd',
                        borderWidth: 1,
                        padding: 10,
                        titleFont: {
                            weight: 600,
                        },
                        bodyFont: {
                            size: 13,
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e0e0e0',
                        },
                        ticks: {
                            color: '#6e6e6e',
                            font: {
                                size: 13,
                            },
                        },
                    },
                    x: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: '#6e6e6e',
                            font: {
                                size: 13,
                            },
                        },
                    },
                },
                ...options,
            }}
            data={data}
        />
    );
}

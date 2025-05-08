/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ChartData, ChartOptions } from "chart.js";

export interface IDoughnutChart {
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


export interface IBarChartProps {
    data: ChartData<'bar'>;
    options: ChartOptions<'bar'>
};

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


export interface IBarChartKeyTable {
    id: number;
    name: string;
    [key: string]: number | string;
  }
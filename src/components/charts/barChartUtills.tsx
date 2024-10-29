import { blue, red } from "@mui/material/colors";
import { IBarChartKeyTable } from "./interface";
import { ChartDataset } from "chart.js";

const BarChartUtills = () => {


  const getLastEightDays = (): string[] => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDate = new Date();
    const lastEightDays = [];

    for (let i = 7; i >= 0; i--) {
      const day = new Date(currentDate);
      day.setDate(day.getDate() - i);

      if (day.toDateString() === currentDate.toDateString()) {
        lastEightDays.push('Today');
      } else {
        const dayOfWeek = daysOfWeek[day.getDay()];
        lastEightDays.push(dayOfWeek);
      }
    }

    return lastEightDays;
  };

  const labels = getLastEightDays();

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Stock Report',
      },
    },
  };


  const barChartData = {
    labels,
    datasets: [
      {
        label: 'Daily Openning Stock',
        data: [660, 700, 440, 550, 380, 620, 480, 310],
        backgroundColor: blue[600],
        barThickness: 40
      },
      {
        label: 'Daily Closing Stock',
        data: [520, 550, 380, 435, 220, 500, 340, 205],
        backgroundColor: red[600],
        barThickness: 40
      }
    ],
  };

  const transactionHistoryChartData = {
    labels,
    datasets: [
      {
        label: 'Daily Openning Stock',
        data: [120000, 70000, 44000, 55000, 38000, 62000, 48000, 31000],
        backgroundColor: blue[600],
        barThickness: 40
      }
    ],
  };

  const barChartKeyTable: Array<IBarChartKeyTable> = [
    {
      id: 1, name: 'Biscuits',
      [labels[0]]: '120',
      [labels[1]]: '100',
      [labels[2]]: '30',
      [labels[3]]: '29',
      [labels[4]]: '60',
      [labels[5]]: '48',
      [labels[6]]: '35',
      [labels[7]]: '45'
    }
  ];


  const weeklyOpeningStockMock = [
    {
      label: 'Biscuits',
      data: [100, 77, 40, 50, 48, 65, 30, 70],
      backgroundColor: blue[500],
      borderColor: blue[500]
    }
  ];

  const createWeeklyData = (result: Array<number | any>): {
    [key: string]: string | number
  } => {
    const labels = getLastEightDays();
    const dataObject: { [key: string]: string | number } = {};

    result.forEach((value, index) => {
      dataObject[labels[index]] = value;
    });

    return dataObject;
  }


  const createKeyTableData = (weeklyData: Array<ChartDataset<'line'>>) => {

    const result = weeklyData.map((data, index) => ({
      id: index,
      name: data.label || '',
      ...createWeeklyData(data.data),
    }));
    return result;
  }


  return ({
    barChartOptions,
    barChartData,
    transactionHistoryChartData,
    barChartKeyTable,
    weeklyOpeningStockMock,
    createKeyTableData
  }
  )
}

export default BarChartUtills;
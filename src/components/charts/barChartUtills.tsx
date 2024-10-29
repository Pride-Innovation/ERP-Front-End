import { blue, red } from "@mui/material/colors";

const BarChartUtills = () => {


  const getLastEightMonths = (): string[] => {
    const monthsOfYear = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentDate = new Date();
    const lastEightMonths = [];

    for (let i = 7; i >= 0; i--) {
      const month = new Date(currentDate);
      month.setMonth(month.getMonth() - i);

      if (i === 0) {
        lastEightMonths.push('This Month');
      } else {
        const monthName = monthsOfYear[month.getMonth()];
        lastEightMonths.push(monthName);
      }
    }

    return lastEightMonths;
  };


  const labels = getLastEightMonths();

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Stock Report',
      },
    },
  };

  const barChartData = {
    labels,
    datasets: [
      {
        label: 'IT Equipment',
        data: [660, 700, 440, 550, 380, 620, 480, 310],
        backgroundColor: blue[600],
        barThickness: 40
      },
      {
        label: 'Office Equipment',
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
        label: 'IT Equipment',
        data: [120000, 70000, 44000, 55000, 38000, 62000, 48000, 31000],
        backgroundColor: blue[600],
        barThickness: 40
      }
    ],
  };


  return ({
    barChartOptions,
    barChartData,
    transactionHistoryChartData,
  }
  )
}

export default BarChartUtills;
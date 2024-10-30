import { getLastSixMonths } from "../../utils/helpers";
import { barGraphMock } from "../../mocks/dahboard";

const BarChartUtills = () => {

  const labels = getLastSixMonths();

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
    datasets: barGraphMock,
  };

  return ({
    barChartOptions,
    barChartData,
  }
  )
}

export default BarChartUtills;
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

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
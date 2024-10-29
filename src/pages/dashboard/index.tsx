import { Box, Card, Grid } from '@mui/material';
import DahboardCard from './DahboardCard';
import Laptop from "../../statics/images/icons8-laptop-50.png";
import Furniture from "../../statics/images/icons8-furniture-50.png";
import Books from "../../statics/images/icons8-books-50.png";
import Vehicle from "../../statics/images/icons8-vehicle-60.png";
import DashboardRequests from './DashboardRequests';
import DoughnutChart from '../../components/charts/DoughnutChart';
import DashboardBarChart from './DashboardBarChart';
import PersonalRequest from './individualRequest';

const Dashboard = () => {
  const headerText = '% of Assets';
  const chartData = [40, 27, 34, 51];
  const labels = [
    "IT Equipment",
    "Office Equipment",
    "Fleet",
    "Stationery"
  ]

  /**
   * 
   * TO DO
   * 
   * The top section should show a report on the remaining stock for each catergory.
   * 
   * Below it on the Left we should show pending requests. For individuals, 
   * It should show their pending requests. If they do not have pending requests, then
   * we should display a list of assets assigned to them.
   * 
   * For admin, it should show all the requests for different branches.
   * 
   * On the right, we will have a pie chart showing percentage of each asset.
   * 
   * Below, we will have asset due for disposal.
   * 
   * The lastly, we will have a horizontal bar chart showing money stocks 
   * for the different categories on monthly basis for the last one year.
   * 
   */

  return (
    <Grid container xs={12}>
      <Box
        display="grid"
        sx={{ width: "100%" }}
        gridTemplateColumns="repeat(4, 1fr)"
        gap={4}
      >
        <DahboardCard name='IT Equipment' number={500} image={Laptop} stockLevel='low' lastUpdated='12-12-2024' />
        <DahboardCard name='Office Equipment' number={500} image={Furniture} stockLevel='normal' lastUpdated='12-12-2024' />
        <DahboardCard name='Fleet' number={500} image={Vehicle} stockLevel='average' lastUpdated='12-12-2024' />
        <DahboardCard name='Stationery' number={500} image={Books} stockLevel='low' lastUpdated='12-12-2024' />
      </Box>
      <Box
        display="grid"
        sx={{ width: "100%" }}
        gridTemplateColumns="repeat(2, 1fr)"
        gap={4}
        mt={4}
      >
        <Card sx={{ boxShadow: 3 }}>
          <DashboardRequests />
        </Card>
        <Card sx={{ boxShadow: 3, p: 2 }}>
          <DoughnutChart
            headerText={headerText}
            chartData={chartData}
            cutout='20%'
            labels={labels}
            radius='65%'
            title="ASSETS PERCENTAGE IN STORE"
            loading={false} />
        </Card>
      </Box>
      <Box
        display="grid"
        sx={{ width: "100%" }}
        gridTemplateColumns="repeat(2, 1fr)"
        gap={4}
        mt={4}
      >
        <Card sx={{ boxShadow: 3 }}>
          <PersonalRequest />
        </Card>
        <Card sx={{ boxShadow: 3 }}>
          <PersonalRequest />
        </Card>
      </Box>
      <Box sx={{ width: "100%" }}>
        <Card sx={{ boxShadow: 3, p: 2, mt: 4 }}>
          <DashboardBarChart />
        </Card>
      </Box>
    </Grid>
  )
}

export default Dashboard;
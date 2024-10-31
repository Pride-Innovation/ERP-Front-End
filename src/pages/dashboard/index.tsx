import { Box, Card, Grid } from '@mui/material';
import DahboardCard from './DahboardCard';
import Laptop from "../../statics/images/icons8-laptop-50.png";
import Furniture from "../../statics/images/icons8-furniture-50.png";
import Books from "../../statics/images/icons8-books-50.png";
import Vehicle from "../../statics/images/icons8-vehicle-60.png";
import DashboardRequests from './DashboardRequests';
import DoughnutChart from '../../components/charts/DoughnutChart';
import DashboardBarChart from './DashboardBarChart';
import PersonalAssets from './individualAssets';
import DisposalAssets from './disposableAssets';

const Dashboard = () => {
  const headerText = '% of Assets';
  const chartData = [40, 27, 34, 51];
  const labels = [
    "IT Equipment",
    "Office Equipment",
    "Fleet",
    "Stationery"
  ]

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
          <PersonalAssets />
        </Card>
        <Card sx={{ boxShadow: 3 }}>
          <DisposalAssets />
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
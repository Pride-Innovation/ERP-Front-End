import { Box, Card, Container, Grid, useTheme } from '@mui/material';
import DahboardCard from './DahboardCard';
import Laptop from "../../statics/images/computer-removebg-preview.png";
import Furniture from "../../statics/images/chair-office-removebg-preview.png";
import Books from "../../statics/images/Archives-removebg-preview.png";
import Vehicle from "../../statics/images/car-image-removebg-preview.png";
import DashboardRequests from './DashboardRequests';
import DoughnutChart from '../../components/charts/DoughnutChart';
import DashboardBarChart from './DashboardBarChart';
import PersonalAssets from './individualAssets';
import DisposalAssets from './disposableAssets';

const Dashboard = () => {
  const theme = useTheme();

  const headerText = '% of Assets';
  const chartData = [40, 27, 34, 51];
  const labels = ["IT Equipment", "Office Equipment", "Fleet", "Stationery"];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {[
          { name: 'IT Equipment', image: Laptop, stockLevel: 'low' },
          { name: 'Office Equipment', image: Furniture, stockLevel: 'normal' },
          { name: 'Fleet', image: Vehicle, stockLevel: 'average' },
          { name: 'Stationery', image: Books, stockLevel: 'low' },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <DahboardCard
              name={item.name}
              number={500}
              image={item.image}
              stockLevel={item.stockLevel}
              lastUpdated='12-12-2024'
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4} mt={1}>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, p: 2 }}>
            {/* <DashboardRequests /> */}
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, p: 2 }}>
            <DoughnutChart
              headerText={headerText}
              chartData={chartData}
              cutout="20%"
              labels={labels}
              radius="65%"
              title="ASSETS PERCENTAGE IN STORE"
              loading={false}
            />
          </Card>
        </Grid>
      </Grid>

      {/* Assets Sections */}
      <Grid container spacing={4} mt={1}>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, p: 2 }}>
            <PersonalAssets />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, p: 2 }}>
            {/* <DisposalAssets /> */}
          </Card>
        </Grid>
      </Grid>

      {/* Bar Chart */}
      <Grid container spacing={4} mt={1}>
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 3, p: 2 }}>
            {/* <DashboardBarChart /> */}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
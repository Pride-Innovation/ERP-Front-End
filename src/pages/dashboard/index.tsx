/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Card, Container, Grid, Typography } from '@mui/material';
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
  const headerText = '% of Assets';
  const chartData = [40, 27, 34, 51];
  const labels = ["IT Equipment", "Office Equipment", "Fleet", "Stationery"];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={700} color="#08796C" sx={{ mb: 2 }}>
          Assets Overview
        </Typography>
        <Grid container spacing={3}>
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
      </Box>

      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h6" fontWeight={700} color="#08796C" sx={{ mb: 2 }}>
          Requests & Asset Distribution
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card sx={{ boxShadow: 2, borderRadius: 3, p: 3, backgroundColor: '#F5F9F8' }}>
              <DoughnutChart
                headerText={headerText}
                chartData={chartData}
                cutout="25%"
                labels={labels}
                radius="70%"
                title="ASSETS PERCENTAGE IN STORE"
                loading={false}
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <Card sx={{ boxShadow: 2, borderRadius: 3, p: 3, backgroundColor: '#F5F9F8' }}>
              <DashboardRequests />
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h6" fontWeight={700} color="#08796C" sx={{ mb: 2 }}>
          Ownership & Disposal Insights
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 2, borderRadius: 3, p: 3, backgroundColor: '#F5F9F8' }}>
              <PersonalAssets />
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 2, borderRadius: 3, p: 3, backgroundColor: '#F5F9F8' }}>
              <DisposalAssets />
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" fontWeight={700} color="#08796C" sx={{ mb: 2 }}>
          Trends & Performance
        </Typography>
        <Card sx={{ boxShadow: 2, borderRadius: 3, p: 3, backgroundColor: '#F5F9F8' }}>
          <DashboardBarChart />
        </Card>
      </Box>
    </Container>
  );
};

export default Dashboard;
import {
  Box,
  Grid,
} from '@mui/material';

import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import RequestRating from './sections/RequestRating';
import AssetStockReview from './sections/AssetStockReview';
import StationeryStock from './sections/StationeryStock';
import RequestReport from './sections/RequestReport';
import LatestRequest from './sections/LatestRequest';

ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);


const Dashboard = () => {

  return (
    <Box p={3} bgcolor="#f5f8fc" minHeight="100vh">
      <Grid container spacing={2} alignItems="stretch">
        {/* Request Rating */}
        <RequestRating />
        {/* AssetStockReview */}
        <AssetStockReview />
        {/* StationeryStock */}
        <StationeryStock />

        {/* Requests Reports */}
        <RequestReport />

        {/* Latest Requests */}
        <LatestRequest />
      </Grid>
    </Box>
  );
};

export default Dashboard;
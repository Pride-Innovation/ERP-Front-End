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
import RequestRating from '../sections/RequestRating';
import AssetStockReview from '../sections/AssetStockReview';
import StationeryStock from '../sections/StationeryStock';
import RequestReport from '../sections/RequestReport';
import LatestRequest from '../sections/LatestRequest';
import AssetInventorySummary from '../sections/AssetInventorySummary';

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

const AdminDashboard = () => {
    return (
        <Box p={3} bgcolor="#f5f8fc" minHeight="100vh">
            {/* Added alignItems="flex-start" to prevent equal height stretching */}
            <Grid container spacing={2} mb={3} alignItems="flex-start">
                {/* Left side - main content */}
                <Grid item xs={9} container spacing={2}>
                    <RequestRating />
                    <AssetStockReview />
                    <RequestReport />
                    <LatestRequest />
                </Grid>

                {/* Right side - sidebar content */}
                <Grid item xs={3}>
                    {/* Create a sidebar container with independent scrolling if needed */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            // Optional: add max-height and overflow if you want scrolling for very tall content
                            // maxHeight: 'calc(100vh - 48px)', // Adjust based on your layout
                            // overflowY: 'auto'
                        }}
                    >
                        {/* Stationery section */}
                        <StationeryStock />

                        {/* Asset Inventory Summary section */}
                        <AssetInventorySummary />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
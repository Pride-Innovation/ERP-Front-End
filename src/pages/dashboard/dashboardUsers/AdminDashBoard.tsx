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
        <Box minHeight="100vh">
            {/* Added alignItems="flex-start" to prevent equal height stretching */}
            <Grid container spacing={2.5} mb={3} alignItems="flex-start">
                {/* Left side - main content */}
                <Grid item xs={12} lg={9} container spacing={2.5}>
                    <RequestRating />
                    <AssetStockReview />
                    <RequestReport />
                    <LatestRequest />
                </Grid>

                {/* Right side - sidebar content */}
                <Grid item xs={12} lg={3}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2.5,
                        }}
                    >
                        <StationeryStock />
                        <AssetInventorySummary />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
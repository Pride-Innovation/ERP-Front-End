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

const BranchOperationsManager = () => {
    return (
        <Box p={3} minHeight="100vh">
            <Grid container spacing={2} mb={3} alignItems="flex-start">
                <Grid item xs={6} container spacing={2} >
                    <RequestRating size={6} />
                    <RequestReport size={6} />
                    <LatestRequest size={12} />
                </Grid>
                <Grid item xs={6}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <StationeryStock />
                        <AssetInventorySummary />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}

export default BranchOperationsManager
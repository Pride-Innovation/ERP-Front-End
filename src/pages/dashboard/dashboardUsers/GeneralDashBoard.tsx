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
import StationeryStock from '../sections/StationeryStock';
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


const GeneralDashBoard = () => {
    return (
        <Box p={3} bgcolor="#f5f8fc" minHeight="100vh">
            <Grid container spacing={2} mb={3} alignItems="flex-start">
                <Grid item xs={3}>
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

export default GeneralDashBoard
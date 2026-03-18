import {
    Box,
    Grid,
    Typography,
    Chip,
    alpha,
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
import RoutesUtills from '../../../core/routes/utills';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

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

const PRIMARY_COLOR = '#08796C';

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
};

const AdminDashboard = () => {
    const { getCurrentUser } = RoutesUtills();
    const user = getCurrentUser();
    const firstName = user?.firstName || '';

    return (
        <Box p={3}>
            {/* ── Page Header ─────────────────────────────────────────── */}
            <Box
                sx={{
                    mb: 3,
                    pb: 2.5,
                    borderBottom: `1px solid ${alpha('#000', 0.06)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                <Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary" mb={0.5}>
                        {getGreeting()}{firstName ? `, ${firstName}` : ''} 👋
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.7}>
                        <CalendarTodayOutlinedIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Typography>
                    </Box>
                </Box>
                <Chip
                    icon={<AdminPanelSettingsOutlinedIcon />}
                    label="Admin Dashboard"
                    sx={{
                        bgcolor: alpha(PRIMARY_COLOR, 0.08),
                        color: PRIMARY_COLOR,
                        fontWeight: 600,
                        height: 32,
                        borderRadius: 2,
                        '& .MuiChip-icon': { color: PRIMARY_COLOR },
                    }}
                />
            </Box>

            {/* ── Dashboard Content ───────────────────────────────────── */}
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <StationeryStock />
                        <AssetInventorySummary />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
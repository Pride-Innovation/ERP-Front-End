import {
    Box,
    Chip,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography,
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
    Filler,
} from 'chart.js';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';

import RoutesUtills from '../../../core/routes/utills';
import KpiSummaryCards from '../sections/KpiSummaryCards';
import AssetDistributionChart from '../sections/AssetDistributionChart';
import RequestsStatusBarChart from '../sections/RequestsStatusBarChart';
import ActiveVsDisposedChart from '../sections/ActiveVsDisposedChart';
import StockTrendLineChart from '../sections/StockTrendLineChart';
import AssetInventorySummary from '../sections/AssetInventorySummary';
import WorkQueueTable from '../sections/WorkQueueTable';

ChartJS.register(
    LineElement, BarElement, PointElement, ArcElement,
    CategoryScale, LinearScale, Title, Tooltip, Legend, Filler
);

const PRIMARY_COLOR = '#08796C';

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
};

const SectionLabel = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <Box display="flex" alignItems="center" gap={1} mb={2} mt={3.5}>
        <Box sx={{ color: PRIMARY_COLOR, display: 'flex' }}>{icon}</Box>
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary"
            textTransform="uppercase" letterSpacing={0.8} fontSize="0.72rem">
            {label}
        </Typography>
        <Divider sx={{ flex: 1 }} />
    </Box>
);

const AdminDashboard = () => {
    const { getCurrentUser } = RoutesUtills();
    const user = getCurrentUser();
    const firstName = user?.firstName || '';

    return (
        <Box p={{ xs: 2, sm: 3 }} sx={{ maxWidth: 1600, mx: 'auto' }}>
            {/* ── Page Header ──────────────────────────────────────── */}
            <Paper
                elevation={0}
                sx={{
                    mb: 3,
                    p: 2.5,
                    borderRadius: 2,
                    border: `1px solid ${alpha('#000', 0.06)}`,
                    background: `linear-gradient(135deg, ${alpha(PRIMARY_COLOR, 0.04)} 0%, ${alpha(PRIMARY_COLOR, 0.01)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                <Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary" mb={0.4}>
                        {getGreeting()}{firstName ? `, ${firstName}` : ''} 👋
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.7}>
                        <CalendarTodayOutlinedIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                            })}
                        </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.disabled" mt={0.25} display="block">
                        You have full visibility across all branches and asset categories.
                    </Typography>
                </Box>
                <Chip
                    icon={<AdminPanelSettingsOutlinedIcon />}
                    label="Admin Dashboard"
                    sx={{
                        bgcolor: alpha(PRIMARY_COLOR, 0.1),
                        color: PRIMARY_COLOR,
                        fontWeight: 600,
                        height: 34,
                        borderRadius: 2,
                        fontSize: '0.8rem',
                        '& .MuiChip-icon': { color: PRIMARY_COLOR },
                    }}
                />
            </Paper>

            {/* ── 1. KPI Overview ──────────────────────────────────── */}
            <SectionLabel icon={<DashboardOutlinedIcon fontSize="small" />} label="Overview" />
            <KpiSummaryCards />

            {/* ── 2. Asset Distribution + Active vs Disposed ─────── */}
            <SectionLabel icon={<AssessmentOutlinedIcon fontSize="small" />} label="Asset Analytics" />
            <Grid container spacing={2.5} alignItems="stretch">
                <Grid item xs={12} lg={5}>
                    <AssetDistributionChart />
                </Grid>
                <Grid item xs={12} lg={7}>
                    <ActiveVsDisposedChart />
                </Grid>
            </Grid>

            {/* ── 3. Requests Overview ────────────────────────────── */}
            <SectionLabel icon={<PendingActionsOutlinedIcon fontSize="small" />} label="Requests Breakdown" />
            <Grid container spacing={2.5} alignItems="stretch">
                <Grid item xs={12}>
                    <RequestsStatusBarChart />
                </Grid>
            </Grid>

            {/* ── 4. Stock Trends + Inventory ─────────────────────── */}
            <SectionLabel icon={<StorefrontOutlinedIcon fontSize="small" />} label="Stock & Inventory" />
            <Grid container spacing={2.5} alignItems="stretch">
                <Grid item xs={12} lg={8}>
                    <StockTrendLineChart />
                </Grid>
                <Grid item xs={12} lg={4}>
                    <AssetInventorySummary />
                </Grid>
            </Grid>

            {/* ── 5. Work Queue ────────────────────────────────────── */}
            <SectionLabel icon={<InventoryOutlinedIcon fontSize="small" />} label="Pending Actions" />
            <WorkQueueTable />
        </Box>
    );
};

export default AdminDashboard;
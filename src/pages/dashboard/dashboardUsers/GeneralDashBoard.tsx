import {
    Box,
    Card,
    Chip,
    Divider,
    Grid,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
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
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';

import { useContext, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import RoutesUtills from '../../../core/routes/utills';
import SectionUtills from '../sections/utills';
import { DashboardContext } from '../../../context/dashboard';
import ExpandableTable from '../sections/PersonalAssetsReport';
import PersonalActivityChart from '../sections/PersonalActivityChart';

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

const getStatusStyle = (status?: string | null) => {
    const s = (status || '').toLowerCase();
    if (s.includes('approved') || s.includes('issued') || s.includes('delivered'))
        return { bg: alpha('#2e7d32', 0.08), color: '#2e7d32', icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} /> };
    if (s.includes('pending') || s.includes('submitted'))
        return { bg: alpha('#f59300', 0.08), color: '#c77800', icon: <HourglassEmptyOutlinedIcon sx={{ fontSize: 14 }} /> };
    if (s.includes('reject'))
        return { bg: alpha('#d32f2f', 0.08), color: '#d32f2f', icon: <CancelOutlinedIcon sx={{ fontSize: 14 }} /> };
    return { bg: alpha('#5f6368', 0.08), color: '#5f6368', icon: null };
};

const GeneralDashBoard = () => {
    const { getCurrentUser } = RoutesUtills();
    const { fetchPersonalAssetReport, findLatestPendingRequestsWithDetails } = SectionUtills();
    const { assetDomain, latestPendingRequests } = useContext(DashboardContext);
    const [loading, setLoading] = useState(true);

    const user = getCurrentUser();
    const firstName = user?.firstName || '';

    useEffect(() => {
        Promise.all([
            fetchPersonalAssetReport(),
            findLatestPendingRequestsWithDetails(),
        ]).finally(() => setLoading(false));
    }, []);

    const totalMyAssets = assetDomain.reduce((sum, d) => sum + (d.totalItems || 0), 0);
    const pendingCount = latestPendingRequests.filter(
        (r) => (r.status?.name || '').toLowerCase().includes('pending') ||
               (r.status?.name || '').toLowerCase().includes('submitted')
    ).length;
    const approvedCount = latestPendingRequests.filter(
        (r) => (r.status?.name || '').toLowerCase().includes('approved')
    ).length;

    const quickStats = [
        {
            label: 'Assets Assigned',
            value: totalMyAssets,
            color: PRIMARY_COLOR,
            icon: <DevicesOutlinedIcon />,
            sub: 'Across all categories',
        },
        {
            label: 'Pending Requests',
            value: pendingCount,
            color: '#f59300',
            icon: <HourglassEmptyOutlinedIcon />,
            sub: 'Awaiting approval',
        },
        {
            label: 'Approved Requests',
            value: approvedCount,
            color: '#2e7d32',
            icon: <CheckCircleOutlineIcon />,
            sub: 'Recently approved',
        },
        {
            label: 'Total Requests',
            value: latestPendingRequests.length,
            color: '#4285F4',
            icon: <AssignmentOutlinedIcon />,
            sub: 'All tracked requests',
        },
    ];

    return (
        <Box p={{ xs: 2, sm: 3 }} sx={{ maxWidth: 1400, mx: 'auto' }}>

            {/* ── Page Header ─────────────────────────────────────────── */}
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
                </Box>
                <Chip
                    icon={<PersonOutlineOutlinedIcon />}
                    label="My Personal Dashboard"
                    sx={{
                        bgcolor: alpha(PRIMARY_COLOR, 0.08),
                        color: PRIMARY_COLOR,
                        fontWeight: 600,
                        height: 32,
                        borderRadius: 2,
                        '& .MuiChip-icon': { color: PRIMARY_COLOR },
                    }}
                />
            </Paper>

            {/* ── Quick Stats ──────────────────────────────────────────── */}
            <Grid container spacing={2}>
                {quickStats.map((stat) => (
                    <Grid item xs={12} sm={6} md={3} key={stat.label}>
                        <Card
                            elevation={0}
                            sx={{
                                p: 2.5,
                                border: `1px solid ${alpha('#000', 0.07)}`,
                                borderRadius: 2,
                                borderTop: `3px solid ${stat.color}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                transition: 'box-shadow 0.2s',
                                '&:hover': { boxShadow: `0 4px 20px ${alpha(stat.color, 0.15)}` },
                            }}
                        >
                            <Box
                                sx={{
                                    bgcolor: alpha(stat.color, 0.1),
                                    color: stat.color,
                                    width: 48,
                                    height: 48,
                                    borderRadius: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                {stat.icon}
                            </Box>
                            <Box>
                                <Typography variant="h4" fontWeight={800} lineHeight={1.1} color={stat.color}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="body2" fontWeight={600} color="text.primary" fontSize="0.82rem">
                                    {stat.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {stat.sub}
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* ── Activity Charts ───────────────────────────────────────── */}
            <SectionLabel icon={<BarChartOutlinedIcon fontSize="small" />} label="My Activity Overview" />
            <PersonalActivityChart />

            {/* ── My Assets ────────────────────────────────────────────── */}
            <SectionLabel icon={<DevicesOutlinedIcon fontSize="small" />} label="My Assets" />
            <Card
                elevation={0}
                sx={{ border: `1px solid ${alpha('#000', 0.08)}`, borderRadius: 2 }}
            >
                <Box
                    px={3}
                    py={2}
                    borderBottom={`1px solid ${alpha('#000', 0.06)}`}
                    sx={{
                        background: `linear-gradient(90deg, ${alpha(PRIMARY_COLOR, 0.03)} 0%, transparent 100%)`,
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                color: PRIMARY_COLOR,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <DevicesOutlinedIcon fontSize="small" />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                                Assets Assigned to Me
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                All assets currently assigned to your profile, grouped by category
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
                {assetDomain.length === 0 && !loading ? (
                    <Box display="flex" flexDirection="column" alignItems="center" py={6} gap={1.5}>
                        <DevicesOutlinedIcon sx={{ fontSize: 52, color: alpha('#000', 0.12) }} />
                        <Typography color="text.secondary" fontWeight={500}>No assets currently assigned to you.</Typography>
                        <Typography variant="caption" color="text.secondary">Contact your administrator to request asset allocation.</Typography>
                    </Box>
                ) : (
                    <ExpandableTable />
                )}
            </Card>

            {/* ── My Requests ──────────────────────────────────────────── */}
            <SectionLabel icon={<ListAltOutlinedIcon fontSize="small" />} label="My Request Tracker" />
            <Card
                elevation={0}
                sx={{ border: `1px solid ${alpha('#000', 0.08)}`, borderRadius: 2 }}
            >
                <Box
                    px={3}
                    py={2}
                    borderBottom={`1px solid ${alpha('#000', 0.06)}`}
                    sx={{
                        background: `linear-gradient(90deg, ${alpha('#4285F4', 0.03)} 0%, transparent 100%)`,
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: alpha('#4285F4', 0.1),
                                color: '#4285F4',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <AssignmentOutlinedIcon fontSize="small" />
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                                My Request Status Tracker
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Track the lifecycle of your submitted asset requests
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                {latestPendingRequests.length === 0 && !loading ? (
                    <Box display="flex" flexDirection="column" alignItems="center" py={6} gap={1.5}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 52, color: alpha('#000', 0.12) }} />
                        <Typography color="text.secondary" fontWeight={500}>No pending requests — you're all clear!</Typography>
                        <Typography variant="caption" color="text.secondary">All your requests have been resolved.</Typography>
                    </Box>
                ) : (
                    <Box sx={{ overflowX: 'auto' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: alpha('#4285F4', 0.03) }}>
                                    {['Request Name', 'Priority', 'Submitted', 'Status'].map((h) => (
                                        <TableCell
                                            key={h}
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                                color: 'text.secondary',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.6,
                                                py: 1.5,
                                                borderBottom: `2px solid ${alpha('#000', 0.06)}`,
                                            }}
                                        >
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {latestPendingRequests.map((req) => {
                                    const statusStyle = getStatusStyle(req.status?.name);
                                    return (
                                        <TableRow
                                            key={req.id}
                                            hover
                                            sx={{
                                                '&:last-child td': { borderBottom: 0 },
                                                '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.02) },
                                            }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 240 }}>
                                                    {req.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={req.priority || 'Normal'}
                                                    size="small"
                                                    sx={{
                                                        height: 22,
                                                        fontWeight: 600,
                                                        bgcolor: alpha('#5f6368', 0.08),
                                                        '& .MuiChip-label': { px: 1, fontSize: '0.7rem' },
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {req.createDate
                                                        ? formatDistanceToNow(new Date(req.createDate), { addSuffix: true })
                                                        : '—'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={statusStyle.icon || undefined}
                                                    label={req.status?.name || 'Pending'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: statusStyle.bg,
                                                        color: statusStyle.color,
                                                        fontWeight: 600,
                                                        height: 24,
                                                        '& .MuiChip-label': { px: 1, fontSize: '0.7rem' },
                                                        '& .MuiChip-icon': { color: statusStyle.color },
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Box>
                )}
            </Card>
        </Box>
    );
};

export default GeneralDashBoard;
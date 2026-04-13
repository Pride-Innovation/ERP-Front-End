import {
    Box,
    Card,
    Chip,
    Grid,
    Stack,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import { Doughnut, Bar } from 'react-chartjs-2';
import LaptopIcon from '@mui/icons-material/Laptop';
import ChairIcon from '@mui/icons-material/Chair';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import { useContext } from 'react';
import { DashboardContext } from '../../../context/dashboard';

const PRIMARY_COLOR = '#08796C';
const PALETTE = [PRIMARY_COLOR, '#BC892C', '#445069'];

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Mock personal request history (last 6 months)
const buildRequestMock = () => {
    const now = new Date();
    const labels: string[] = [];
    const submitted: number[] = [];
    const approved: number[] = [];
    const rejected: number[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(MONTHS_SHORT[d.getMonth()]);
        const s = Math.floor(Math.random() * 4) + 1;
        const a = Math.floor(Math.random() * s);
        submitted.push(s);
        approved.push(a);
        rejected.push(s - a > 0 ? Math.floor(Math.random() * (s - a)) : 0);
    }
    return { labels, submitted, approved, rejected };
};

const mock = buildRequestMock();

const SectionHeader = ({
    icon,
    title,
    subtitle,
    accentColor,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    accentColor: string;
}) => (
    <Stack direction="row" alignItems="flex-start" spacing={1.5} mb={2.5}>
        <Box
            sx={{
                width: 36,
                height: 36,
                bgcolor: alpha(accentColor, 0.1),
                color: accentColor,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}
        >
            {icon}
        </Box>
        <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {subtitle}
            </Typography>
        </Box>
    </Stack>
);

const CategoryRow = ({
    icon,
    label,
    count,
    total,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    count: number;
    total: number;
    color: string;
}) => (
    <Stack direction="row" alignItems="center" spacing={1.5} mb={1.2}>
        <Box sx={{ color, display: 'flex', flexShrink: 0 }}>{icon}</Box>
        <Box flex={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.4}>
                <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
                    {label}
                </Typography>
                <Typography variant="caption" fontWeight={700} color={color}>
                    {count}
                </Typography>
            </Stack>
            <Box
                sx={{
                    height: 5,
                    borderRadius: 3,
                    bgcolor: alpha(color, 0.12),
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        height: '100%',
                        width: `${total > 0 ? (count / total) * 100 : 0}%`,
                        bgcolor: color,
                        borderRadius: 3,
                        transition: 'width 0.8s ease',
                    }}
                />
            </Box>
        </Box>
    </Stack>
);

const PersonalActivityChart = () => {
    const { assetDomain } = useContext(DashboardContext);

    const categoryMap: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
        'IT Equipment': { label: 'IT Equipment', icon: <LaptopIcon fontSize="small" />, color: PRIMARY_COLOR },
        'Office Equipment': { label: 'Office Equip.', icon: <ChairIcon fontSize="small" />, color: '#BC892C' },
        'Fleet': { label: 'Fleet / Vehicles', icon: <DirectionsCarIcon fontSize="small" />, color: '#445069' },
    };

    // Build doughnut data from live context
    const categories = Object.keys(categoryMap);
    const counts = categories.map((cat) => {
        const found = assetDomain.find(
            (d) => (d.domain || '').toLowerCase().includes(cat.split(' ')[0].toLowerCase())
        );
        return found?.totalItems || 0;
    });
    const totalAssets = counts.reduce((a, b) => a + b, 0);

    const doughnutData = {
        labels: categories.map((c) => categoryMap[c].label),
        datasets: [
            {
                data: counts.length > 0 && totalAssets > 0 ? counts : [1],
                backgroundColor:
                    totalAssets > 0
                        ? PALETTE.map((c) => alpha(c, 0.85))
                        : [alpha('#ccc', 0.4)],
                borderColor:
                    totalAssets > 0 ? PALETTE : ['#ccc'],
                borderWidth: 2,
                hoverOffset: 10,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        cutout: '68%',
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx: any) =>
                        totalAssets > 0
                            ? ` ${ctx.label}: ${ctx.parsed} assets`
                            : ' No assets assigned',
                },
            },
        },
    } as const;

    const barData = {
        labels: mock.labels,
        datasets: [
            {
                label: 'Submitted',
                data: mock.submitted,
                backgroundColor: alpha(PRIMARY_COLOR, 0.75),
                borderRadius: 4,
                borderSkipped: false,
            },
            {
                label: 'Approved',
                data: mock.approved,
                backgroundColor: alpha('#2e7d32', 0.75),
                borderRadius: 4,
                borderSkipped: false,
            },
            {
                label: 'Rejected',
                data: mock.rejected,
                backgroundColor: alpha('#d32f2f', 0.75),
                borderRadius: 4,
                borderSkipped: false,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, font: { size: 11 } },
            },
            tooltip: { mode: 'index' as const, intersect: false },
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            y: {
                beginAtZero: true,
                grid: { color: alpha('#000', 0.05) },
                ticks: { stepSize: 1, font: { size: 11 }, precision: 0 },
            },
        },
    };

    const summaryStats = [
        {
            label: 'Total Submitted',
            value: mock.submitted.reduce((a, b) => a + b, 0),
            color: PRIMARY_COLOR,
            icon: <HourglassEmptyOutlinedIcon sx={{ fontSize: 16 }} />,
        },
        {
            label: 'Approved',
            value: mock.approved.reduce((a, b) => a + b, 0),
            color: '#2e7d32',
            icon: <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />,
        },
        {
            label: 'Rejected',
            value: mock.rejected.reduce((a, b) => a + b, 0),
            color: '#d32f2f',
            icon: <CancelOutlinedIcon sx={{ fontSize: 16 }} />,
        },
    ];

    return (
        <Grid container spacing={2.5}>
            {/* ── My Assets Doughnut ───────────────────── */}
            <Grid item xs={12} md={4}>
                <Card
                    elevation={0}
                    sx={{
                        height: '100%',
                        border: `1px solid ${alpha('#000', 0.07)}`,
                        borderRadius: 2,
                        p: 2.5,
                    }}
                >
                    <SectionHeader
                        icon={<DevicesOutlinedIcon fontSize="small" />}
                        title="My Assets by Category"
                        subtitle="Breakdown of assigned assets"
                        accentColor={PRIMARY_COLOR}
                    />

                    {/* Doughnut */}
                    <Box sx={{ position: 'relative', maxWidth: 180, mx: 'auto', mb: 2.5 }}>
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                            }}
                        >
                            <Typography variant="h5" fontWeight={800} lineHeight={1} color="text.primary">
                                {totalAssets}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Total
                            </Typography>
                        </Box>
                    </Box>

                    {/* Category rows */}
                    <Box>
                        {categories.map((cat, i) => (
                            <CategoryRow
                                key={cat}
                                icon={categoryMap[cat].icon}
                                label={categoryMap[cat].label}
                                count={counts[i]}
                                total={totalAssets}
                                color={PALETTE[i]}
                            />
                        ))}
                    </Box>

                    {totalAssets === 0 && (
                        <Box
                            sx={{
                                mt: 1.5,
                                p: 1.5,
                                borderRadius: 1.5,
                                bgcolor: alpha(PRIMARY_COLOR, 0.04),
                                border: `1px dashed ${alpha(PRIMARY_COLOR, 0.2)}`,
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">
                                No assets currently assigned to your profile
                            </Typography>
                        </Box>
                    )}
                </Card>
            </Grid>

            {/* ── My Request Activity Bar ──────────────── */}
            <Grid item xs={12} md={8}>
                <Card
                    elevation={0}
                    sx={{
                        height: '100%',
                        border: `1px solid ${alpha('#000', 0.07)}`,
                        borderRadius: 2,
                        p: 2.5,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="space-between"
                        mb={2.5}
                        flexWrap="wrap"
                        gap={1}
                    >
                        <SectionHeader
                            icon={<TimelineOutlinedIcon fontSize="small" />}
                            title="My Request Activity"
                            subtitle="Last 6 months · submitted vs approved vs rejected"
                            accentColor="#4285F4"
                        />
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {summaryStats.map((s) => (
                                <Stack
                                    key={s.label}
                                    direction="row"
                                    alignItems="center"
                                    spacing={0.5}
                                    sx={{
                                        px: 1.2,
                                        py: 0.5,
                                        borderRadius: 1.5,
                                        bgcolor: alpha(s.color, 0.07),
                                    }}
                                >
                                    <Box sx={{ color: s.color, display: 'flex' }}>{s.icon}</Box>
                                    <Typography variant="caption" fontWeight={700} color={s.color}>
                                        {s.value}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {s.label}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Stack>

                    <Box flex={1} minHeight={220}>
                        <Bar data={barData} options={barOptions} />
                    </Box>

                    <Box
                        sx={{
                            mt: 2,
                            pt: 1.5,
                            borderTop: `1px solid ${alpha('#000', 0.06)}`,
                        }}
                    >
                        <Typography variant="caption" color="text.secondary">
                            * Request activity chart uses estimated data for illustration. Live data will be displayed when the backend endpoint is integrated.
                        </Typography>
                    </Box>
                </Card>
            </Grid>
        </Grid>
    );
};

export default PersonalActivityChart;

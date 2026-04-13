import {
    Box,
    Card,
    Chip,
    Divider,
    Grid,
    Skeleton,
    Stack,
    Typography,
    alpha,
} from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import ComputerIcon from '@mui/icons-material/Computer';
import ChairIcon from '@mui/icons-material/Chair';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined';
import CountUp from 'react-countup';
import { useContext, useEffect, useState } from 'react';
import { DashboardContext } from '../../../context/dashboard';
import SectionUtills from './utills';

const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';
const FLEET_COLOR = '#445069';

const CATEGORIES = [
    {
        key: 'itequipment',
        label: 'IT Equipment',
        color: PRIMARY_COLOR,
        icon: <ComputerIcon sx={{ fontSize: 18 }} />,
    },
    {
        key: 'officeequipment',
        label: 'Office Equipment',
        color: SECONDARY_COLOR,
        icon: <ChairIcon sx={{ fontSize: 18 }} />,
    },
    {
        key: 'fleet',
        label: 'Fleet / Vehicles',
        color: FLEET_COLOR,
        icon: <DirectionsCarIcon sx={{ fontSize: 18 }} />,
    },
];

// Mini segmented bar showing assigned / in-store / maintenance split
const SegmentBar = ({
    assigned,
    inStore,
    maintenance,
    total,
    color,
}: {
    assigned: number;
    inStore: number;
    maintenance: number;
    total: number;
    color: string;
}) => {
    const safe = total || 1;
    const segments = [
        { value: assigned, color: alpha(color, 0.9) },
        { value: inStore, color: alpha('#4285F4', 0.75) },
        { value: maintenance, color: alpha('#f59300', 0.75) },
    ];
    return (
        <Box
            sx={{
                height: 5,
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                bgcolor: alpha('#000', 0.06),
            }}
        >
            {segments.map((seg, i) => (
                <Box
                    key={i}
                    sx={{
                        width: `${(seg.value / safe) * 100}%`,
                        bgcolor: seg.color,
                        transition: 'width 0.8s ease',
                    }}
                />
            ))}
        </Box>
    );
};

const AssetDistributionChart = () => {
    const { assetStats } = useContext(DashboardContext);
    const { fetchBranchAssetStatics } = SectionUtills();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBranchAssetStatics().finally(() => setLoading(false));
    }, []);

    const categoryTotals = CATEGORIES.map(
        (cat) => (assetStats as any)?.[cat.key]?.total || 0
    );
    const total = categoryTotals.reduce((a, b) => a + b, 0) || 1;

    const doughnutData = {
        labels: CATEGORIES.map((c) => c.label),
        datasets: [
            {
                data: categoryTotals,
                backgroundColor: CATEGORIES.map((c) => c.color),
                hoverBackgroundColor: CATEGORIES.map((c) => alpha(c.color, 0.75)),
                borderWidth: 3,
                borderColor: '#fff',
                hoverOffset: 6,
            },
        ],
    };

    const doughnutOptions = {
        cutout: '74%',
        responsive: true,
        maintainAspectRatio: false,
        animation: { animateScale: true },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15,20,30,0.9)',
                titleFont: { size: 12, weight: 'bold' as const },
                bodyFont: { size: 12 },
                padding: 10,
                callbacks: {
                    label: (ctx: any) => {
                        const pct = ((ctx.raw / total) * 100).toFixed(1);
                        return `  ${ctx.label}: ${ctx.raw.toLocaleString()} assets (${pct}%)`;
                    },
                },
            },
        },
    };

    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                border: `1px solid ${alpha('#000', 0.08)}`,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* ── Card Header ─────────────────────────────────── */}
            <Box
                px={2.5}
                py={1.75}
                display="flex"
                alignItems="center"
                gap={1.5}
                sx={{
                    borderBottom: `1px solid ${alpha('#000', 0.06)}`,
                    background: `linear-gradient(90deg, ${alpha(PRIMARY_COLOR, 0.04)} 0%, transparent 60%)`,
                }}
            >
                <Box
                    sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        bgcolor: alpha(PRIMARY_COLOR, 0.1),
                        color: PRIMARY_COLOR,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <DonutLargeOutlinedIcon fontSize="small" />
                </Box>
                <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                        Asset Distribution
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        By category — IT, Office, Fleet
                    </Typography>
                </Box>
                <Chip
                    label={`${total.toLocaleString()} total`}
                    size="small"
                    sx={{
                        bgcolor: alpha(PRIMARY_COLOR, 0.08),
                        color: PRIMARY_COLOR,
                        fontWeight: 700,
                        height: 24,
                        fontSize: '0.72rem',
                    }}
                />
            </Box>

            {/* ── Card Body ───────────────────────────────────── */}
            <Box p={2.5} sx={{ flex: 1 }}>
                <Grid container spacing={2.5} alignItems="center">

                    {/* Doughnut */}
                    <Grid item xs={12} sm={5}>
                        <Box sx={{ position: 'relative', height: 200 }}>
                            {loading ? (
                                <Skeleton
                                    variant="circular"
                                    width={200}
                                    height={200}
                                    sx={{ mx: 'auto' }}
                                />
                            ) : (
                                <>
                                    <Doughnut data={doughnutData} options={doughnutOptions as any} />
                                    {/* Center label */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            textAlign: 'center',
                                            pointerEvents: 'none',
                                        }}
                                    >
                                        <Typography
                                            variant="h5"
                                            fontWeight={800}
                                            color="text.primary"
                                            lineHeight={1.1}
                                        >
                                            <CountUp end={total} duration={1.5} separator="," />
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                            Assets
                                        </Typography>
                                    </Box>
                                </>
                            )}
                        </Box>

                        {/* Color legend below chart */}
                        <Stack direction="row" justifyContent="center" spacing={2} mt={2} flexWrap="wrap">
                            {CATEGORIES.map((cat) => (
                                <Stack key={cat.key} direction="row" alignItems="center" spacing={0.5}>
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: cat.color,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary" fontSize="0.68rem">
                                        {cat.label.split(' ')[0]}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Per-category breakdown */}
                    <Grid item xs={12} sm={7}>
                        <Stack spacing={0} divider={<Divider sx={{ opacity: 0.5 }} />}>
                            {CATEGORIES.map((cat, i) => {
                                const stats = (assetStats as any)?.[cat.key];
                                const catTotal = stats?.total || 0;
                                const assigned = stats?.assigned || 0;
                                const inStore = stats?.unassigned || 0;
                                const maintenance = stats?.inMaintenance || 0;
                                const pct = total > 1
                                    ? Math.round((catTotal / total) * 100)
                                    : 0;

                                return (
                                    <Box key={cat.key} py={1.75} px={0.5}>
                                        {/* Row 1: Icon + name + count + pct badge */}
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            justifyContent="space-between"
                                            mb={1}
                                        >
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Box
                                                    sx={{
                                                        width: 30,
                                                        height: 30,
                                                        borderRadius: 1,
                                                        bgcolor: alpha(cat.color, 0.1),
                                                        color: cat.color,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {cat.icon}
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={700} lineHeight={1.1}>
                                                        {cat.label}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                            <Stack direction="row" alignItems="center" spacing={0.75}>
                                                {loading ? (
                                                    <Skeleton width={36} height={20} />
                                                ) : (
                                                    <Typography variant="body2" fontWeight={800} color={cat.color}>
                                                        {catTotal.toLocaleString()}
                                                    </Typography>
                                                )}
                                                <Chip
                                                    label={`${pct}%`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(cat.color, 0.1),
                                                        color: cat.color,
                                                        fontWeight: 700,
                                                        height: 20,
                                                        '& .MuiChip-label': { px: 0.8, fontSize: '0.65rem' },
                                                    }}
                                                />
                                            </Stack>
                                        </Stack>

                                        {/* Segmented bar */}
                                        {!loading && (
                                            <SegmentBar
                                                assigned={assigned}
                                                inStore={inStore}
                                                maintenance={maintenance}
                                                total={catTotal}
                                                color={cat.color}
                                            />
                                        )}

                                        {/* Row 3: stat pills */}
                                        {!loading && (
                                            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                                                {[
                                                    { label: 'Assigned', value: assigned, color: alpha(cat.color, 0.9) },
                                                    { label: 'In Store', value: inStore, color: '#4285F4' },
                                                    { label: 'Repair', value: maintenance, color: '#f59300' },
                                                ].map((pill) => (
                                                    <Stack
                                                        key={pill.label}
                                                        direction="row"
                                                        alignItems="center"
                                                        spacing={0.4}
                                                        sx={{
                                                            px: 0.9,
                                                            py: 0.25,
                                                            borderRadius: 1,
                                                            bgcolor: alpha(pill.color, 0.07),
                                                            border: `1px solid ${alpha(pill.color, 0.15)}`,
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 5,
                                                                height: 5,
                                                                borderRadius: '50%',
                                                                bgcolor: pill.color,
                                                                flexShrink: 0,
                                                            }}
                                                        />
                                                        <Typography variant="caption" color="text.secondary" fontSize="0.68rem">
                                                            {pill.label}
                                                        </Typography>
                                                        <Typography variant="caption" fontWeight={700} color={pill.color} fontSize="0.68rem">
                                                            {pill.value}
                                                        </Typography>
                                                    </Stack>
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </Card>
    );
};

export default AssetDistributionChart;

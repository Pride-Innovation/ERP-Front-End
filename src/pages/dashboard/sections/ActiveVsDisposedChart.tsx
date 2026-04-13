import {
    Box,
    Card,
    Chip,
    Grid,
    Stack,
    Typography,
    alpha,
} from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import CountUp from 'react-countup';

const PRIMARY_COLOR = '#08796C';

// Mock data — realistic for a mid-sized organisation
const MOCK_TOTAL = 620;
const MOCK_SEGMENTS = [
    { label: 'In Use',        value: 368, color: '#2e7d32',  lightColor: alpha('#2e7d32', 0.1),  icon: <CheckCircleOutlineIcon fontSize="small" /> },
    { label: 'In Store',      value: 148, color: PRIMARY_COLOR, lightColor: alpha(PRIMARY_COLOR, 0.1), icon: <CheckCircleOutlineIcon fontSize="small" /> },
    { label: 'In Repair',     value:  52, color: '#f59300',  lightColor: alpha('#f59300', 0.1),  icon: <BuildOutlinedIcon fontSize="small" /> },
    { label: 'Disposed',      value:  52, color: '#d32f2f',  lightColor: alpha('#d32f2f', 0.1),  icon: <DeleteOutlineIcon fontSize="small" /> },
];

const ActiveVsDisposedChart = () => {
    const activeTotal = MOCK_SEGMENTS.slice(0, 3).reduce((a, b) => a + b.value, 0);
    const disposedTotal = MOCK_SEGMENTS[3].value;
    const activeRate = Math.round((activeTotal / MOCK_TOTAL) * 100);

    const doughnutData = {
        labels: MOCK_SEGMENTS.map((s) => s.label),
        datasets: [
            {
                data: MOCK_SEGMENTS.map((s) => s.value),
                backgroundColor: MOCK_SEGMENTS.map((s) => s.color),
                hoverBackgroundColor: MOCK_SEGMENTS.map((s) => alpha(s.color, 0.8)),
                borderWidth: 2,
                borderColor: '#fff',
            },
        ],
    };

    const doughnutOptions = {
        cutout: '70%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: alpha('#000', 0.82),
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (ctx: any) => {
                        const pct = ((ctx.raw / MOCK_TOTAL) * 100).toFixed(1);
                        return ` ${ctx.label}: ${ctx.raw} assets (${pct}%)`;
                    },
                },
            },
        },
    };

    return (
        <Card
            elevation={0}
            sx={{ height: '100%', border: `1px solid ${alpha('#000', 0.08)}`, borderRadius: 2 }}
        >
            {/* Header */}
            <Box px={3} py={2} borderBottom={`1px solid ${alpha('#000', 0.06)}`} display="flex" alignItems="center">
                <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: alpha(PRIMARY_COLOR, 0.08), color: PRIMARY_COLOR, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, flexShrink: 0 }}>
                    <CheckCircleOutlineIcon fontSize="small" />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={600}>Active vs Disposed Assets</Typography>
                    <Typography variant="caption" color="text.secondary">Asset lifecycle status breakdown</Typography>
                </Box>
            </Box>

            <Box p={3}>
                <Grid container spacing={2} alignItems="center">
                    {/* Chart */}
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ position: 'relative', height: 200 }}>
                            <Doughnut data={doughnutData} options={doughnutOptions as any} />
                            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                <Typography variant="h5" fontWeight={700} color="text.primary" lineHeight={1.1}>
                                    <CountUp end={MOCK_TOTAL} duration={1.5} separator="," />
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Total</Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Segments breakdown */}
                    <Grid item xs={12} sm={6}>
                        <Stack spacing={1.5}>
                            {MOCK_SEGMENTS.map((seg) => {
                                const pct = Math.round((seg.value / MOCK_TOTAL) * 100);
                                return (
                                    <Box key={seg.label} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: seg.lightColor, border: `1px solid ${alpha(seg.color, 0.15)}` }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Box sx={{ color: seg.color, display: 'flex' }}>{seg.icon}</Box>
                                                <Typography variant="body2" fontWeight={500} color="text.primary">{seg.label}</Typography>
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="body2" fontWeight={700} color={seg.color}>
                                                    {seg.value}
                                                </Typography>
                                                <Chip label={`${pct}%`} size="small" sx={{ bgcolor: alpha(seg.color, 0.15), color: seg.color, fontWeight: 600, height: 20, '& .MuiChip-label': { px: 0.75, fontSize: '0.65rem' } }} />
                                            </Box>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Stack>

                        <Box sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: alpha(PRIMARY_COLOR, 0.04), border: `1px solid ${alpha(PRIMARY_COLOR, 0.12)}`, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">Active Rate</Typography>
                            <Typography variant="h6" fontWeight={700} color={PRIMARY_COLOR}>{activeRate}%</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Card>
    );
};

export default ActiveVsDisposedChart;

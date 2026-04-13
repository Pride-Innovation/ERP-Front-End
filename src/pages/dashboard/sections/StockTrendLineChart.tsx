import {
    Box,
    Card,
    MenuItem,
    Select,
    Stack,
    Typography,
    alpha,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useState } from 'react';

const PRIMARY_COLOR = '#08796C';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Mock monthly stocking data per category
const MOCK_DATA: Record<string, Record<string, number[]>> = {
    '2025': {
        'IT Equipment':     [12, 18, 10, 22, 27, 19, 30, 35, 26, 20, 28, 38],
        'Office Equipment': [8,  12,  7, 15, 18, 13, 21, 25, 18, 14, 20, 26],
        'Fleet':            [1,   2,  1,  3,  2,  1,  3,  4,  2,  2,  3,  4],
    },
    '2024': {
        'IT Equipment':     [8,  11,  9, 16, 20, 15, 23, 28, 21, 17, 24, 30],
        'Office Equipment': [5,   9,  6, 11, 14, 10, 16, 20, 14, 11, 16, 21],
        'Fleet':            [1,   1,  1,  2,  2,  1,  2,  3,  2,  1,  2,  3],
    },
};

const LINES = [
    { key: 'IT Equipment',     color: PRIMARY_COLOR },
    { key: 'Office Equipment', color: '#BC892C' },
    { key: 'Fleet',            color: '#445069' },
];

const StockTrendLineChart = () => {
    const [year, setYear] = useState<string>('2025');

    const data = MOCK_DATA[year];

    const chartData = {
        labels: MONTHS,
        datasets: LINES.map((line) => ({
            label: line.key,
            data: data[line.key],
            borderColor: line.color,
            backgroundColor: alpha(line.color, 0.07),
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: '#fff',
            pointBorderColor: line.color,
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: line.color,
            pointHoverBorderWidth: 2.5,
        })),
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index' as const, intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: alpha('#000', 0.82),
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 13, weight: 600 as any },
                bodyFont: { size: 12 },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: alpha('#000', 0.55), font: { size: 11 } },
                border: { display: false },
            },
            y: {
                grid: { color: alpha('#000', 0.05) },
                ticks: { color: alpha('#000', 0.45), font: { size: 11 } },
                border: { display: false },
                beginAtZero: true,
            },
        },
    };

    // Totals for the selected year
    const yearTotals = LINES.map((line) => ({
        ...line,
        total: data[line.key].reduce((a, b) => a + b, 0),
    }));

    return (
        <Card
            elevation={0}
            sx={{ height: '100%', border: `1px solid ${alpha('#000', 0.08)}`, borderRadius: 2 }}
        >
            {/* Header */}
            <Box
                px={3} py={2}
                borderBottom={`1px solid ${alpha('#000', 0.06)}`}
                display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}
            >
                <Box display="flex" alignItems="center">
                    <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: alpha(PRIMARY_COLOR, 0.08), color: PRIMARY_COLOR, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, flexShrink: 0 }}>
                        <TrendingUpIcon fontSize="small" />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={600}>Assets Stocked Over Time</Typography>
                        <Typography variant="caption" color="text.secondary">Monthly stock intake — by category</Typography>
                    </Box>
                </Box>
                <Select
                    size="small"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    sx={{ fontSize: '0.8rem', height: 32, '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#000', 0.12) } }}
                >
                    <MenuItem value="2025">2025</MenuItem>
                    <MenuItem value="2024">2024</MenuItem>
                </Select>
            </Box>

            <Box p={3}>
                {/* Legend + totals */}
                <Stack direction="row" flexWrap="wrap" gap={2.5} mb={2.5}>
                    {yearTotals.map((line) => (
                        <Box key={line.key} display="flex" alignItems="center" gap={1}>
                            <Box sx={{ width: 28, height: 3, borderRadius: 2, bgcolor: line.color }} />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2}>{line.key}</Typography>
                                <Typography variant="caption" fontWeight={700} color={line.color}>{line.total} stocked</Typography>
                            </Box>
                        </Box>
                    ))}
                </Stack>

                {/* Chart */}
                <Box sx={{ height: 250 }}>
                    <Line data={chartData} options={chartOptions} />
                </Box>
            </Box>
        </Card>
    );
};

export default StockTrendLineChart;

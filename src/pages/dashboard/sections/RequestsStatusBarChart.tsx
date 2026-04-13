import {
    Box,
    Card,
    Chip,
    MenuItem,
    Select,
    Stack,
    Typography,
    alpha,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { useState } from 'react';

const PRIMARY_COLOR = '#08796C';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Mock data representing 12 months of request activity
const MOCK_DATA: Record<string, { submitted: number[]; approved: number[]; rejected: number[]; pending: number[] }> = {
    all: {
        submitted: [42, 55, 38, 67, 72, 58, 81, 94, 76, 63, 88, 103],
        approved: [30, 40, 28, 51, 58, 44, 63, 74, 61, 50, 70, 84],
        rejected: [7,  8,  6,  9,  7,  8,  10, 12,  9,  7,  10, 11],
        pending:  [5,  7,  4,  7,  7,  6,  8,  8,   6,  6,  8,  8],
    },
    it_equipment: {
        submitted: [18, 22, 15, 27, 30, 24, 35, 40, 32, 26, 38, 44],
        approved:  [13, 16, 11, 21, 24, 18, 27, 32, 26, 21, 30, 36],
        rejected:  [3,  4,  2,  4,  4,  3,  5,  5,  4,  3,  5,  5],
        pending:   [2,  2,  2,  2,  2,  3,  3,  3,  2,  2,  3,  3],
    },
    office_equipment: {
        submitted: [14, 18, 12, 22, 24, 19, 27, 31, 25, 21, 29, 35],
        approved:  [10, 13,  9, 17, 19, 14, 21, 24, 20, 16, 23, 28],
        rejected:  [2,  3,  2,  3,  3,  3,  4,  4,  3,  3,  4,  4],
        pending:   [2,  2,  1,  2,  2,  2,  2,  3,  2,  2,  2,  3],
    },
    stationery: {
        submitted: [10, 15, 11, 18, 18, 15, 19, 23, 19, 16, 21, 24],
        approved:  [7,  11,  8, 13, 15, 12, 15, 18, 15, 13, 17, 20],
        rejected:  [2,  1,   2,  2,  0,  2,  1,  3,  2,  1,  1,  2],
        pending:   [1,  3,   1,  3,  3,  1,  3,  2,  2,  2,  3,  2],
    },
};

const LEGEND_ITEMS = [
    { key: 'submitted', label: 'Submitted', color: '#4285F4' },
    { key: 'approved',  label: 'Approved',  color: '#2e7d32' },
    { key: 'rejected',  label: 'Rejected',  color: '#d32f2f' },
    { key: 'pending',   label: 'Pending',   color: '#f59300' },
];

const RequestsStatusBarChart = () => {
    const [filter, setFilter] = useState<string>('all');

    const d = MOCK_DATA[filter];

    const chartData = {
        labels: MONTHS,
        datasets: [
            {
                label: 'Submitted',
                data: d.submitted,
                backgroundColor: alpha('#4285F4', 0.85),
                borderRadius: 4,
                borderSkipped: false,
            },
            {
                label: 'Approved',
                data: d.approved,
                backgroundColor: alpha('#2e7d32', 0.85),
                borderRadius: 4,
                borderSkipped: false,
            },
            {
                label: 'Rejected',
                data: d.rejected,
                backgroundColor: alpha('#d32f2f', 0.85),
                borderRadius: 4,
                borderSkipped: false,
            },
            {
                label: 'Pending',
                data: d.pending,
                backgroundColor: alpha('#f59300', 0.85),
                borderRadius: 4,
                borderSkipped: false,
            },
        ],
    };

    const totalSubmitted = d.submitted.reduce((a, b) => a + b, 0);
    const totalApproved  = d.approved.reduce((a, b) => a + b, 0);

    const approvalRate = totalSubmitted > 0 ? Math.round((totalApproved / totalSubmitted) * 100) : 0;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: alpha('#000', 0.82),
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 13, weight: 600 as any },
                bodyFont: { size: 12 },
                callbacks: {
                    title: (items: any[]) => `${items[0].label} 2025`,
                },
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
                ticks: { color: alpha('#000', 0.45), font: { size: 11 }, stepSize: 10 },
                border: { display: false },
                beginAtZero: true,
            },
        },
    };

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
                        <AssignmentOutlinedIcon fontSize="small" />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                            Asset Requests Overview
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Monthly request status breakdown — {new Date().getFullYear()}
                        </Typography>
                    </Box>
                </Box>
                <Select
                    size="small"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    sx={{ fontSize: '0.8rem', height: 32, minWidth: 150, '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#000', 0.12) } }}
                >
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="it_equipment">IT Equipment</MenuItem>
                    <MenuItem value="office_equipment">Office Equipment</MenuItem>
                    <MenuItem value="stationery">Stationery</MenuItem>
                </Select>
            </Box>

            <Box p={3}>
                {/* Summary chips */}
                <Stack direction="row" spacing={1.5} flexWrap="wrap" mb={2.5}>
                    <Chip
                        label={`${totalSubmitted.toLocaleString()} Total`}
                        size="small"
                        sx={{ bgcolor: alpha('#4285F4', 0.08), color: '#4285F4', fontWeight: 600, height: 26 }}
                    />
                    <Chip
                        label={`${approvalRate}% Approval Rate`}
                        size="small"
                        sx={{ bgcolor: alpha('#2e7d32', 0.08), color: '#2e7d32', fontWeight: 600, height: 26 }}
                    />
                </Stack>

                {/* Legend */}
                <Stack direction="row" flexWrap="wrap" gap={2} mb={2}>
                    {LEGEND_ITEMS.map((item) => (
                        <Box key={item.key} display="flex" alignItems="center" gap={0.75}>
                            <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: item.color, flexShrink: 0 }} />
                            <Typography variant="caption" color="text.secondary" fontWeight={500}>{item.label}</Typography>
                        </Box>
                    ))}
                </Stack>

                {/* Chart */}
                <Box sx={{ height: 240 }}>
                    <Bar data={chartData} options={chartOptions as any} />
                </Box>
            </Box>
        </Card>
    );
};

export default RequestsStatusBarChart;

import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    alpha,
    Divider,
    Stack
} from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import SectionUtills from "./utills";
import { useContext, useEffect } from "react";
import { DashboardContext } from "../../../context/dashboard";
import InventoryIcon from '@mui/icons-material/Inventory';
import EditNoteIcon from '@mui/icons-material/EditNote';
import StyleIcon from '@mui/icons-material/Style';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

// Primary brand colors
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

// Define professional color palette for chart
const CHART_COLORS = [
    PRIMARY_COLOR,          // Pens (Primary teal)
    SECONDARY_COLOR,        // Sticky Notes (Gold)
    '#4285F4',             // Markers (Professional blue)
    '#9C27B0'              // Others (Deep purple)
];

// Icons for each category
const CATEGORY_ICONS = [
    <EditNoteIcon fontSize="small" />,
    <StyleIcon fontSize="small" />,
    <EditNoteIcon fontSize="small" />,
    <MoreHorizIcon fontSize="small" />
];

const CATEGORY_UNITS = ["dozen", "boxes", "dozen", "items"];

const StationeryStock = () => {
    const { getMonthlyStationeryTotals } = SectionUtills();
    const { monthlyStationeryStats, monthlyStationeryStatslabels } = useContext(DashboardContext);

    useEffect(() => { getMonthlyStationeryTotals() }, []);

    const totalItems = Array.isArray(monthlyStationeryStats)
        ? monthlyStationeryStats.reduce((sum, value) => sum + value, 0)
        : 0;

    const chartOptions = {
        cutout: '75%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: alpha('#000', 0.75),
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 600, // Changed from '600' string to numeric 600
                    family: "'Roboto', 'Helvetica', 'Arial', sans-serif" // Added font family for completeness
                },
                bodyFont: {
                    size: 13,
                    weight: 400,
                    family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
                },
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    label: function (context: any) {
                        const value = context.raw;
                        const percentage = ((value / totalItems) * 100).toFixed(1);
                        return `${value} units (${percentage}%)`;
                    }
                }
            }
        },
    } as const;

    const chartData = {
        labels: monthlyStationeryStatslabels,
        datasets: [
            {
                data: monthlyStationeryStats,
                backgroundColor: CHART_COLORS,
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 6,
            },
        ],
    };

    return (
        <Grid item xs={12} md={12}>
            <Card
                elevation={0}
                sx={{
                    height: '100%',
                    borderRadius: 2,
                    border: `1px solid ${alpha('#000', 0.08)}`,
                    boxShadow: `0 1px 4px ${alpha('#000', 0.06)}, 0 4px 16px ${alpha('#000', 0.04)}`,
                    overflow: 'hidden'
                }}
            >
                <Box
                    sx={{
                        px: 2.5,
                        py: 2,
                        borderBottom: `1px solid ${alpha('#000', 0.06)}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box display="flex" alignItems="center">
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 36,
                                height: 36,
                                borderRadius: 1,
                                bgcolor: alpha(PRIMARY_COLOR, 0.08),
                                color: PRIMARY_COLOR,
                                mr: 2
                            }}
                        >
                            <InventoryIcon fontSize="small" />
                        </Box>
                        <Box>
                            <Typography
                                variant="subtitle1"
                                fontWeight={600}
                                color="text.primary"
                            >
                                Stationery Stock
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </Typography>
                        </Box>
                    </Box>

                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                            color: PRIMARY_COLOR,
                            bgcolor: alpha(PRIMARY_COLOR, 0.08),
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '1rem'
                        }}
                    >
                        {totalItems}
                    </Typography>
                </Box>

                <CardContent sx={{ p: 2.5, pt: 2 }}>
                    <Box sx={{ position: 'relative', height: 200, my: 1 }}>
                        <Doughnut
                            data={chartData}
                            options={chartOptions}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center'
                            }}
                        >
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                color={PRIMARY_COLOR}
                            >
                                {totalItems}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Total Items
                            </Typography>
                        </Box>
                    </Box>

                    <Box mt={2} mb={1} display="flex" justifyContent="center">
                        <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
                            {(monthlyStationeryStatslabels || [])?.map((label, index) => {
                                // Get color with fallback to prevent undefined
                                const color = CHART_COLORS[index % CHART_COLORS.length] || PRIMARY_COLOR;

                                return (
                                    <Box
                                        key={`legend-${index}`}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            px: 1.2,
                                            py: 0.5,
                                            borderRadius: 1,
                                            bgcolor: alpha(color, 0.1),
                                            mr: { xs: 0.5, sm: 0 },
                                            mb: { xs: 0.5, sm: 0 }
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: '50%',
                                                bgcolor: color,
                                                mr: 1
                                            }}
                                        />
                                        <Typography variant="caption" fontWeight={500} color={color}>
                                            {label || 'Unknown'}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Box>

                    <Divider sx={{ my: 2, borderColor: alpha('#000', 0.06) }} />

                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight={500}
                            sx={{
                                mb: 1.5,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <Box
                                component="span"
                                sx={{
                                    width: 4,
                                    height: 16,
                                    borderRadius: 1,
                                    bgcolor: PRIMARY_COLOR,
                                    display: 'inline-block',
                                    mr: 1
                                }}
                            />
                            Current Month Distribution
                        </Typography>

                        <Stack spacing={1.2}>
                            {(monthlyStationeryStatslabels || []).map((label, index) => {
                                // Get color with fallback to prevent undefined
                                const color = CHART_COLORS[index % CHART_COLORS.length] || PRIMARY_COLOR;
                                // Get icon with fallback
                                const icon = CATEGORY_ICONS[index % CATEGORY_ICONS.length] || <MoreHorizIcon fontSize="small" />;
                                // Get unit with fallback
                                const unit = CATEGORY_UNITS[index % CATEGORY_UNITS.length] || "items";

                                return (
                                    <Box
                                        key={`item-${index}`}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 1,
                                            borderRadius: 1,
                                            bgcolor: alpha(color, 0.05),
                                            border: `1px solid ${alpha(color, 0.1)}`,
                                        }}
                                    >
                                        <Box display="flex" alignItems="center">
                                            <Box
                                                sx={{
                                                    width: 28,
                                                    height: 28,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '50%',
                                                    bgcolor: alpha(color, 0.15),
                                                    color: color,
                                                    mr: 1.5
                                                }}
                                            >
                                                {icon}
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                                    {label || 'Unknown'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {unit}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography
                                            variant="subtitle2"
                                            fontWeight="700"
                                            sx={{
                                                color: color,
                                                bgcolor: alpha(color, 0.15),
                                                borderRadius: 1,
                                                px: 1.2,
                                                py: 0.3
                                            }}
                                        >
                                            {monthlyStationeryStats?.[index] || 0}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    );
};

export default StationeryStock;
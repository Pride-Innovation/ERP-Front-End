import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    alpha,
    Chip,
    Divider,
    Stack,
    useTheme
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import ComputerIcon from '@mui/icons-material/Computer';
import ChairIcon from '@mui/icons-material/Chair';
import SectionUtills from "./utills";
import { useContext, useEffect } from "react";
import { DashboardContext } from "../../../context/dashboard";

// Primary brand colors
const PRIMARY_COLOR = '#08796C'; // Teal
const SECONDARY_COLOR = '#BC892C'; // Gold/Amber

const AssetStockReview = () => {
    const theme = useTheme();
    const {
        monthlyItStats,
        monthlyOfficeStats,
        monthlyItAndOfficeStatslabels
    } = useContext(DashboardContext);
    const { getMonthlyItAndOfficeStatsFxn } = SectionUtills();

    // Calculate totals
    const itTotal = monthlyItStats.reduce((acc, curr) => acc + curr, 0);
    const officeTotal = monthlyOfficeStats.reduce((acc, curr) => acc + curr, 0);

    useEffect(() => {
        getMonthlyItAndOfficeStatsFxn();
    }, []);

    return (
        <>
            <Grid item xs={12} md={8}>
                <Card
                    elevation={0}
                    sx={{
                        height: '100%',
                        border: `1px solid ${alpha('#000', 0.08)}`,
                        borderRadius: 2,
                        boxShadow: `0 1px 4px ${alpha('#000', 0.06)}, 0 4px 16px ${alpha('#000', 0.04)}`,
                    }}
                >
                    {/* Card Header */}
                    <Box
                        sx={{
                            px: 3,
                            py: 2,
                            borderBottom: `1px solid ${alpha('#000', 0.06)}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
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
                                <AssessmentOutlinedIcon fontSize="small" />
                            </Box>
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'text.primary',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    Asset Stock Review
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Yearly asset acquisition trends
                                </Typography>
                            </Box>
                        </Box>

                        <Chip
                            label="12 Months"
                            size="small"
                            sx={{
                                bgcolor: alpha(PRIMARY_COLOR, 0.08),
                                color: PRIMARY_COLOR,
                                fontWeight: 500,
                                '& .MuiChip-label': { px: 1.5 }
                            }}
                        />
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                        {/* Asset Totals */}
                        <Box
                            display="flex"
                            gap={3}
                            mb={3}
                            sx={{
                                flexDirection: { xs: 'column', sm: 'row' }
                            }}
                        >
                            {/* IT Assets Card */}
                            <Box
                                sx={{
                                    flex: 1,
                                    p: 2.5,
                                    borderRadius: 1,
                                    border: `1px solid ${alpha(PRIMARY_COLOR, 0.15)}`,
                                    bgcolor: alpha(PRIMARY_COLOR, 0.03),
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <Box
                                    sx={{
                                        bgcolor: PRIMARY_COLOR,
                                        color: 'white',
                                        p: 1.2,
                                        borderRadius: 1,
                                        mr: 2,
                                        display: 'flex'
                                    }}
                                >
                                    <ComputerIcon />
                                </Box>
                                <Box>
                                    <Typography variant="body2" fontWeight={500} color="text.secondary" mb={0.5}>
                                        IT Assets Total
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold" color={PRIMARY_COLOR}>
                                        {itTotal.toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Office Assets Card */}
                            <Box
                                sx={{
                                    flex: 1,
                                    p: 2.5,
                                    borderRadius: 1,
                                    border: `1px solid ${alpha(SECONDARY_COLOR, 0.15)}`,
                                    bgcolor: alpha(SECONDARY_COLOR, 0.03),
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <Box
                                    sx={{
                                        bgcolor: SECONDARY_COLOR,
                                        color: 'white',
                                        p: 1.2,
                                        borderRadius: 1,
                                        mr: 2,
                                        display: 'flex'
                                    }}
                                >
                                    <ChairIcon />
                                </Box>
                                <Box>
                                    <Typography variant="body2" fontWeight={500} color="text.secondary" mb={0.5}>
                                        Office Assets Total
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold" color={SECONDARY_COLOR}>
                                        {officeTotal.toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Chart Section */}
                        <Box
                            sx={{
                                p: 2,
                                bgcolor: alpha('#f8f9fa', 0.5),
                                borderRadius: 1,
                                border: `1px solid ${alpha('#000', 0.05)}`,
                            }}
                        >
                            {/* Chart Title */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 2
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                                    Monthly Asset Acquisition
                                </Typography>

                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Box display="flex" alignItems="center">
                                        <Box
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: '50%',
                                                bgcolor: PRIMARY_COLOR,
                                                mr: 0.5
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            IT
                                        </Typography>
                                    </Box>

                                    <Box display="flex" alignItems="center">
                                        <Box
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: '50%',
                                                bgcolor: SECONDARY_COLOR,
                                                mr: 0.5
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            Office
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            {/* Chart */}
                            <Box height={300}>
                                <Bar
                                    data={{
                                        labels: monthlyItAndOfficeStatslabels,
                                        datasets: [
                                            {
                                                label: 'Office Assets',
                                                data: monthlyOfficeStats,
                                                backgroundColor: SECONDARY_COLOR,
                                                stack: 'combined',
                                                barPercentage: 0.6,
                                                categoryPercentage: 0.7,
                                            },
                                            {
                                                label: 'IT Assets',
                                                data: monthlyItStats,
                                                backgroundColor: PRIMARY_COLOR,
                                                stack: 'combined',
                                                barPercentage: 0.6,
                                                categoryPercentage: 0.7,
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: false // Hide default legend, we have custom one
                                            },
                                            tooltip: {
                                                mode: 'index',
                                                intersect: false,
                                                backgroundColor: alpha('#000', 0.75),
                                                titleColor: '#fff',
                                                bodyColor: '#fff',
                                                padding: 12,
                                                cornerRadius: 4,
                                                boxPadding: 4
                                            },
                                        },
                                        scales: {
                                            x: {
                                                stacked: true,
                                                ticks: {
                                                    color: theme.palette.text.secondary,
                                                    font: {
                                                        size: 10
                                                    }
                                                },
                                                grid: { display: false },
                                                border: { display: false }
                                            },
                                            y: {
                                                stacked: true,
                                                ticks: {
                                                    color: theme.palette.text.secondary,
                                                    font: {
                                                        size: 10
                                                    }
                                                },
                                                grid: {
                                                    color: alpha('#000', 0.04),
                                                    // drawBorder: false
                                                },
                                                border: { display: false },
                                                min: 0,
                                                // Make max dynamic based on data but with some padding
                                                suggestedMax: Math.max(...monthlyItStats, ...monthlyOfficeStats) * 1.2
                                            },
                                        },
                                    }}
                                />
                            </Box>

                            {/* Legend with totals */}
                            <Divider sx={{ my: 2 }} />

                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="caption" color="text.secondary">
                                    Total Assets: <b>{(itTotal + officeTotal).toLocaleString()}</b>
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Generated on {new Date().toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </>
    );
};

export default AssetStockReview;
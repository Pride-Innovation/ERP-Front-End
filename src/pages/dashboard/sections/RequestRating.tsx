import {
    Box,
    Card,
    CardContent,
    Divider,
    Grid,
    LinearProgress,
    Tooltip,
    Typography,
    alpha,
} from '@mui/material';
import {
    Star,
    StarBorder,
    TrendingUp,
    TrendingDown,
    AssessmentOutlined,
    Inventory2Outlined
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { useContext, useEffect } from 'react';
import SectionUtills from './utills';
import { DashboardContext } from '../../../context/dashboard';

// Primary brand colors
const PRIMARY_COLOR = '#08796C'; // Teal
const SECONDARY_COLOR = '#BC892C'; // Gold

// Complementary colors for better visual hierarchy
const STAR_COLOR = '#FFC107'; // Amber for stars
const POSITIVE_COLOR = '#4CAF50'; // Green for positive trends
const NEGATIVE_COLOR = '#F44336'; // Red for negative trends
const CHART_COLOR = '#3f51b5'; // Indigo for chart

const RequestRating = ({ size = 4 }: { size?: number }) => {
    const {
        requestRatingStatsLabels,
        requestRatingStats,
        requestVariationStats,
        monthlyITandOfficeSummaryStats
    } = useContext(DashboardContext);
    const {
        requestRatingStatsFxn,
        requestRatingVariationFxn,
        getItAndOfficeMonthlyStockSummaryFxn
    } = SectionUtills();

    useEffect(() => {
        requestRatingStatsFxn();
        requestRatingVariationFxn();
        getItAndOfficeMonthlyStockSummaryFxn();
    }, []);

    const ratingValue = requestVariationStats.currentMonth < 25 ? "3.0" :
        requestVariationStats.currentMonth < 50 ? "4.0" : "5.0";

    const starCount = requestVariationStats.currentMonth < 25 ? 3 :
        requestVariationStats.currentMonth < 50 ? 4 : 5;

    const isIncrease = requestVariationStats.currentMonth > requestVariationStats.previousMonth;
    const changePercentage = isIncrease
        ? ((requestVariationStats.currentMonth - requestVariationStats.previousMonth) / 100).toFixed(2)
        : ((requestVariationStats.previousMonth - requestVariationStats.currentMonth) / 100).toFixed(2);

    const chartData = {
        labels: requestRatingStatsLabels,
        datasets: [
            {
                label: 'Rating Trend',
                data: requestRatingStats,
                borderColor: CHART_COLOR,
                backgroundColor: alpha(CHART_COLOR, 0.1),
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: CHART_COLOR,
                pointBorderWidth: 1.5,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: CHART_COLOR,
                pointHoverBorderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: alpha('#000', 0.75),
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 600
                },
                bodyFont: {
                    size: 13,
                    weight: 400
                }
            }
        },
        scales: {
            y: {
                display: false,
                beginAtZero: true
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: alpha('#000', 0.6),
                    font: {
                        size: 10
                    }
                }
            },
        },
    };

    return (
        <Grid
            item
            xs={12}
            md={size}
        >
            <Card
                elevation={0}
                sx={{
                    borderRadius: 1,
                    border: `1px solid ${alpha('#000', 0.08)}`,
                    boxShadow: `0 1px 3px ${alpha('#000', 0.1)}, 0 1px 2px ${alpha('#000', 0.06)}`,
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
                        bgcolor: alpha(PRIMARY_COLOR, 0.03)
                    }}
                >
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
                        <AssessmentOutlined fontSize="small" />
                    </Box>
                    <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        color="text.primary"
                    >
                        Request Rating
                    </Typography>
                </Box>

                <CardContent sx={{ p: 2.5 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            pb: 1.5
                        }}
                    >
                        <Typography
                            variant="h3"
                            fontWeight="bold"
                            color="text.primary"
                            sx={{ mb: 1 }}
                        >
                            {ratingValue}
                        </Typography>

                        <Box display="flex" alignItems="center" mb={1}>
                            {[...Array(5)].map((_, i) =>
                                i < starCount ? (
                                    <Star key={i} sx={{ color: STAR_COLOR, fontSize: 22, mx: 0.2 }} />
                                ) : (
                                    <StarBorder key={i} sx={{ color: alpha(STAR_COLOR, 0.4), fontSize: 22, mx: 0.2 }} />
                                )
                            )}
                        </Box>

                        <Box
                            display="flex"
                            alignItems="center"
                            sx={{
                                py: 0.6,
                                px: 1.5,
                                borderRadius: 1,
                                bgcolor: alpha(isIncrease ? POSITIVE_COLOR : NEGATIVE_COLOR, 0.1),
                                mb: 1.5
                            }}
                        >
                            {isIncrease ?
                                <TrendingUp sx={{ color: POSITIVE_COLOR, fontSize: 16, mr: 0.7 }} /> :
                                <TrendingDown sx={{ color: NEGATIVE_COLOR, fontSize: 16, mr: 0.7 }} />
                            }
                            <Typography
                                variant="caption"
                                fontWeight={500}
                                sx={{
                                    color: isIncrease ? POSITIVE_COLOR : NEGATIVE_COLOR
                                }}
                            >
                                {isIncrease ? `+${changePercentage}%` : `-${changePercentage}%`} from last month
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ height: 120, mt: 1, mb: 1 }}>
                        <Line data={chartData} options={chartOptions} />
                    </Box>
                </CardContent>
            </Card>

            <Card
                elevation={0}
                sx={{
                    mt: 2.5,
                    borderRadius: 1,
                    border: `1px solid ${alpha(PRIMARY_COLOR, 0.12)}`,
                    boxShadow: `0 1px 3px ${alpha('#000', 0.1)}, 0 1px 2px ${alpha('#000', 0.06)}`,
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        px: 2.5,
                        py: 2,
                        borderBottom: `1px solid ${alpha('#000', 0.06)}`,
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: alpha(PRIMARY_COLOR, 0.03)
                    }}
                >
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
                        <Inventory2Outlined fontSize="small" />
                    </Box>
                    <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        color="text.primary"
                    >
                        Inventory Summary
                    </Typography>
                </Box>

                <CardContent sx={{ p: 2.5 }}>
                    {/* Top Issued Section */}
                    <Box mb={2.5}>
                        <Typography
                            variant="subtitle2"
                            color="text.primary"
                            fontWeight={600}
                            mb={1.5}
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Box
                                component="span"
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: SECONDARY_COLOR,
                                    display: 'inline-block',
                                    mr: 1
                                }}
                            />
                            Top Issued – {new Date().toLocaleDateString('en-US', { month: 'long' })}
                        </Typography>

                        <Grid container spacing={2}>
                            {/* IT Equipment */}
                            <Grid item xs={6}>
                                <Tooltip title="IT Equipment" arrow placement="top">
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 1,
                                            bgcolor: alpha(SECONDARY_COLOR, 0.04),
                                            border: `1px solid ${alpha(SECONDARY_COLOR, 0.1)}`,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            fontWeight="600"
                                            color={SECONDARY_COLOR}
                                            noWrap
                                            sx={{
                                                fontSize: '0.875rem',
                                                textOverflow: 'ellipsis',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '100%'
                                            }}
                                        >
                                            {monthlyITandOfficeSummaryStats[0]?.mostStockedItem || 'N/A'}
                                        </Typography>
                                        <Box display="flex" alignItems="center" mt={0.5} mb={0.8}>
                                            <Typography
                                                variant="caption"
                                                fontWeight={500}
                                                color="text.secondary"
                                            >
                                                {monthlyITandOfficeSummaryStats[0]?.mostStockedQuantity || 0} units
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={
                                                monthlyITandOfficeSummaryStats[0]?.mostStockedQuantity
                                                    ? (monthlyITandOfficeSummaryStats[0].mostStockedQuantity /
                                                        (monthlyITandOfficeSummaryStats[0].mostStockedQuantity + 20)) * 100
                                                    : 0
                                            }
                                            sx={{
                                                height: 5,
                                                borderRadius: 5,
                                                bgcolor: alpha(SECONDARY_COLOR, 0.12),
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: SECONDARY_COLOR,
                                                    borderRadius: 5
                                                }
                                            }}
                                        />
                                    </Box>
                                </Tooltip>
                            </Grid>

                            {/* Office Furniture */}
                            <Grid item xs={6}>
                                <Tooltip title="Office Furniture" arrow placement="top">
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 1,
                                            bgcolor: alpha(SECONDARY_COLOR, 0.04),
                                            border: `1px solid ${alpha(SECONDARY_COLOR, 0.1)}`,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            fontWeight="600"
                                            color={SECONDARY_COLOR}
                                            noWrap
                                            sx={{
                                                fontSize: '0.875rem',
                                                textOverflow: 'ellipsis',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '100%'
                                            }}
                                        >
                                            {monthlyITandOfficeSummaryStats[1]?.mostStockedItem || 'N/A'}
                                        </Typography>
                                        <Box display="flex" alignItems="center" mt={0.5} mb={0.8}>
                                            <Typography
                                                variant="caption"
                                                fontWeight={500}
                                                color="text.secondary"
                                            >
                                                {monthlyITandOfficeSummaryStats[1]?.mostStockedQuantity || 0} units
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={
                                                monthlyITandOfficeSummaryStats[1]?.mostStockedQuantity
                                                    ? (monthlyITandOfficeSummaryStats[1].mostStockedQuantity /
                                                        (monthlyITandOfficeSummaryStats[1].mostStockedQuantity + 20)) * 100
                                                    : 0
                                            }
                                            sx={{
                                                height: 5,
                                                borderRadius: 5,
                                                bgcolor: alpha(SECONDARY_COLOR, 0.12),
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: SECONDARY_COLOR,
                                                    borderRadius: 5
                                                }
                                            }}
                                        />
                                    </Box>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 2, borderColor: alpha('#000', 0.06) }} />

                    {/* Least Issued Section */}
                    <Box>
                        <Typography
                            variant="subtitle2"
                            color="text.primary"
                            fontWeight={600}
                            mb={1.5}
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            <Box
                                component="span"
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: NEGATIVE_COLOR,
                                    display: 'inline-block',
                                    mr: 1
                                }}
                            />
                            Least Issued – {new Date().toLocaleDateString('en-US', { month: 'long' })}
                        </Typography>

                        <Grid container spacing={2}>
                            {/* IT Equipment */}
                            <Grid item xs={6}>
                                <Tooltip title="IT Equipment" arrow placement="bottom">
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 1,
                                            bgcolor: alpha(NEGATIVE_COLOR, 0.04),
                                            border: `1px solid ${alpha(NEGATIVE_COLOR, 0.1)}`,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            fontWeight="600"
                                            color={NEGATIVE_COLOR}
                                            noWrap
                                            sx={{
                                                fontSize: '0.875rem',
                                                textOverflow: 'ellipsis',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '100%'
                                            }}
                                        >
                                            {monthlyITandOfficeSummaryStats[0]?.leastStockedItem || 'N/A'}
                                        </Typography>
                                        <Box display="flex" alignItems="center" mt={0.5} mb={0.8}>
                                            <Typography
                                                variant="caption"
                                                fontWeight={500}
                                                color="text.secondary"
                                            >
                                                {monthlyITandOfficeSummaryStats[0]?.leastStockedQuantity || 0} units
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={
                                                monthlyITandOfficeSummaryStats[0]?.leastStockedQuantity
                                                    ? (monthlyITandOfficeSummaryStats[0].leastStockedQuantity /
                                                        (monthlyITandOfficeSummaryStats[0].leastStockedQuantity + 20)) * 100
                                                    : 0
                                            }
                                            sx={{
                                                height: 5,
                                                borderRadius: 5,
                                                bgcolor: alpha(NEGATIVE_COLOR, 0.12),
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: NEGATIVE_COLOR,
                                                    borderRadius: 5
                                                }
                                            }}
                                        />
                                    </Box>
                                </Tooltip>
                            </Grid>

                            {/* Office Furniture */}
                            <Grid item xs={6}>
                                <Tooltip title="Office Furniture" arrow placement="bottom">
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 1,
                                            bgcolor: alpha(NEGATIVE_COLOR, 0.04),
                                            border: `1px solid ${alpha(NEGATIVE_COLOR, 0.1)}`,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            fontWeight="600"
                                            color={NEGATIVE_COLOR}
                                            noWrap
                                            sx={{
                                                fontSize: '0.875rem',
                                                textOverflow: 'ellipsis',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '100%'
                                            }}
                                        >
                                            {monthlyITandOfficeSummaryStats[1]?.leastStockedItem || 'N/A'}
                                        </Typography>
                                        <Box display="flex" alignItems="center" mt={0.5} mb={0.8}>
                                            <Typography
                                                variant="caption"
                                                fontWeight={500}
                                                color="text.secondary"
                                            >
                                                {monthlyITandOfficeSummaryStats[1]?.leastStockedQuantity || 0} units
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={
                                                monthlyITandOfficeSummaryStats[1]?.leastStockedQuantity
                                                    ? (monthlyITandOfficeSummaryStats[1].leastStockedQuantity /
                                                        (monthlyITandOfficeSummaryStats[1].leastStockedQuantity + 20)) * 100
                                                    : 0
                                            }
                                            sx={{
                                                height: 5,
                                                borderRadius: 5,
                                                bgcolor: alpha(NEGATIVE_COLOR, 0.12),
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: NEGATIVE_COLOR,
                                                    borderRadius: 5
                                                }
                                            }}
                                        />
                                    </Box>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    );
};

export default RequestRating;
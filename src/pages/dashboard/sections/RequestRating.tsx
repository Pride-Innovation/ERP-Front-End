import {
    Box,
    Card,
    CardContent,
    Divider,
    Grid,
    LinearProgress,
    Tooltip,
    Typography
} from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { useContext, useEffect } from 'react';
import SectionUtills from './utills';
import { DashboardContext } from '../../../context/dashboard';

const RequestRating = () => {
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
        requestRatingStatsFxn()
        requestRatingVariationFxn();
        getItAndOfficeMonthlyStockSummaryFxn();
    }, [])

    return (<>
        <Grid item xs={12} md={3}>
            <Card>
                <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Request Rating</Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                        <Typography variant="h3" fontWeight="bold" mr={1}>{
                            requestVariationStats.currentMonth < 25 ? "3.0" :
                                requestVariationStats.currentMonth < 50 ? "4.0" : "5.0"
                        }</Typography>
                        <Box display="flex" alignItems="center">
                            {[...Array(
                                requestVariationStats.currentMonth < 25 ? 3 :
                                    requestVariationStats.currentMonth < 50 ? 4 : 5
                            )].map((_, i) =>
                                <Star key={i} sx={{ color: '#FFA534', fontSize: 20 }} />)}
                            <StarBorder sx={{ color: '#CCC', fontSize: 20 }} />
                        </Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#4caf50' }}>{
                        requestVariationStats.currentMonth > requestVariationStats.previousMonth
                            ? `+${((requestVariationStats.currentMonth - requestVariationStats.previousMonth) / 100).toFixed(2)} % increase from last month`
                            : `-${((requestVariationStats.previousMonth - requestVariationStats.currentMonth) / 100).toFixed(2)} % decrease from last month`
                    } </Typography>
                    <Box mt={2}>
                        <Line
                            data={{
                                labels: requestRatingStatsLabels,
                                datasets: [
                                    {
                                        label: 'Total',
                                        data: requestRatingStats,
                                        borderColor: '#3f51b5',
                                        backgroundColor: 'rgba(63, 81, 181, 0.1)',
                                        tension: 0.4,
                                        fill: true,
                                        pointRadius: 3,
                                        pointHoverRadius: 4,
                                    },
                                ],
                            }}
                            options={{
                                responsive: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { display: false },
                                    x: { ticks: { color: '#999' } },
                                },
                            }}
                        />
                    </Box>
                </CardContent>
            </Card>
            <Card
                elevation={3}
                sx={{
                    mt: 2.5,
                    borderRadius: 2,
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #0A796C 0%, #065750 100%)',
                }}
            >
                <CardContent sx={{ p: 2.5 }}>
                    {/* Top Issued Section */}
                    <Box mb={2}>
                        <Typography
                            variant="subtitle2"
                            color="rgba(255,255,255,0.9)"
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
                                    bgcolor: 'warning.main',
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
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color="warning.main"
                                            noWrap
                                            sx={{
                                                fontSize: '1rem',
                                                textOverflow: 'ellipsis',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '100%'
                                            }}
                                        >
                                            {monthlyITandOfficeSummaryStats[0]?.mostStockedItem || 'N/A'}
                                        </Typography>
                                        <Box display="flex" alignItems="center" mt={0.5}>
                                            <Typography
                                                variant="caption"
                                                color="background.paper"
                                                fontWeight={500}
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
                                                height: 4,
                                                mt: 0.5,
                                                borderRadius: 1,
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: 'warning.main'
                                                }
                                            }}
                                        />
                                    </Box>
                                </Tooltip>
                            </Grid>

                            {/* Office Furniture */}
                            <Grid item xs={6}>
                                <Tooltip title="Office Furniture" arrow placement="top">
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color="warning.main"
                                            noWrap
                                            sx={{
                                                fontSize: '1rem',
                                                textOverflow: 'ellipsis',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '100%'
                                            }}
                                        >
                                            {monthlyITandOfficeSummaryStats[1]?.mostStockedItem || 'N/A'}
                                        </Typography>
                                        <Box display="flex" alignItems="center" mt={0.5}>
                                            <Typography
                                                variant="caption"
                                                color="background.paper"
                                                fontWeight={500}
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
                                                height: 4,
                                                mt: 0.5,
                                                borderRadius: 1,
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: 'warning.main'
                                                }
                                            }}
                                        />
                                    </Box>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.15)', my: 2 }} />

                    {/* Least Issued Section */}
                    <Box>
                        <Typography
                            variant="subtitle2"
                            color="rgba(255,255,255,0.9)"
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
                                    bgcolor: 'error.main',
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
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color="error.light"
                                            noWrap
                                            sx={{
                                                fontSize: '1rem',
                                                textOverflow: 'ellipsis',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '100%'
                                            }}
                                        >
                                            {monthlyITandOfficeSummaryStats[0]?.leastStockedItem || 'N/A'}
                                        </Typography>
                                        <Box display="flex" alignItems="center" mt={0.5}>
                                            <Typography
                                                variant="caption"
                                                color="background.paper"
                                                fontWeight={500}
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
                                                height: 4,
                                                mt: 0.5,
                                                borderRadius: 1,
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: 'error.light'
                                                }
                                            }}
                                        />
                                    </Box>
                                </Tooltip>
                            </Grid>

                            {/* Office Furniture */}
                            <Grid item xs={6}>
                                <Tooltip title="Office Furniture" arrow placement="bottom">
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color="error.light"
                                            noWrap
                                            sx={{
                                                fontSize: '1rem',
                                                textOverflow: 'ellipsis',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '100%'
                                            }}
                                        >
                                            {monthlyITandOfficeSummaryStats[1]?.leastStockedItem || 'N/A'}
                                        </Typography>
                                        <Box display="flex" alignItems="center" mt={0.5}>
                                            <Typography
                                                variant="caption"
                                                color="background.paper"
                                                fontWeight={500}
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
                                                height: 4,
                                                mt: 0.5,
                                                borderRadius: 1,
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: 'error.light'
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
    </>
    )
}

export default RequestRating
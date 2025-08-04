import {
    Box,
    Card,
    CardContent,
    Divider,
    Grid,
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
            <Card sx={{ mt: 2, p: 2, bgcolor: "primary.main" }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} container>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="background.paper">
                                Top Stocked – {new Date().toLocaleDateString('en-US', { month: 'long' })}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Box display="flex" flexDirection="column">
                                <Typography variant="h6" fontWeight="bold" color="warning.main">
                                    {monthlyITandOfficeSummaryStats[0]?.mostStockedItem}
                                </Typography>
                                <Typography variant="caption" color="background.paper">Total: {" "}
                                    {monthlyITandOfficeSummaryStats[0]?.mostStockedQuantity} units
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} display="flex" justifyContent="flex-end">
                            <Box display="flex" flexDirection="column">
                                <Typography variant="h6" fontWeight="bold" color="warning.main">
                                    {monthlyITandOfficeSummaryStats[1]?.mostStockedItem}
                                </Typography>
                                <Typography variant="caption" color="background.paper">Total: {" "}
                                    {monthlyITandOfficeSummaryStats[1]?.mostStockedQuantity} units
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Divider sx={{ bgcolor: 'background.paper' }} />
                    </Grid>

                    <Grid item xs={12} container>
                        <Grid item xs={12} container>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="background.paper">
                                    Least Stocked – {new Date().toLocaleDateString('en-US', { month: 'long' })}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Box display="flex" flexDirection="column">
                                    <Typography variant="h6" fontWeight="bold" color="error.main">
                                        {monthlyITandOfficeSummaryStats[0]?.leastStockedItem}
                                    </Typography>
                                    <Typography variant="caption" color="background.paper">Total: {" "}
                                        {monthlyITandOfficeSummaryStats[0]?.leastStockedQuantity} units
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6} display="flex" justifyContent="flex-end">
                                <Box display="flex" flexDirection="column">
                                    <Typography variant="h6" fontWeight="bold" color="error.main">
                                        {monthlyITandOfficeSummaryStats[1]?.leastStockedItem}
                                    </Typography>
                                    <Typography variant="caption" color="background.paper">Total: {" "}
                                        {monthlyITandOfficeSummaryStats[1]?.leastStockedQuantity} units
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Card>
        </Grid>
    </>
    )
}

export default RequestRating
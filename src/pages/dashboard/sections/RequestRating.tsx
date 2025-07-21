import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography
} from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { useEffect } from 'react';
import { requestRatingStatsService } from './service';
import { IRequestRatingStatsAxiosResponse } from './interface';


const RequestRating = () => {

    const requestRatingStats = async () => {
        try {
            const response = await requestRatingStatsService() as IRequestRatingStatsAxiosResponse;
            if (response.status === 200) {
                // Handle the response data if needed
                console.log("Request Rating Stats:", response.data);
            }
        } catch (error) {
            console.error("Error fetching request rating stats:", error);
        }
    }

    useEffect(() => { requestRatingStats() }, [])

    return (<>
        <Grid item xs={12} md={3}>
            <Card>
                <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">Request Rating</Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                        <Typography variant="h3" fontWeight="bold" mr={1}>4.0</Typography>
                        <Box display="flex" alignItems="center">
                            {[...Array(4)].map((_, i) => <Star key={i} sx={{ color: '#FFA534', fontSize: 20 }} />)}
                            <StarBorder sx={{ color: '#CCC', fontSize: 20 }} />
                        </Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#4caf50' }}>+0.5 points from last month</Typography>
                    <Box mt={2}>
                        <Line
                            data={{
                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                datasets: [
                                    {
                                        label: 'Rating',
                                        data: [3.2, 3.4, 3.3, 3.6, 3.7, 3.5, 3.6, 3.8, 3.9, 4.0, 4.0, 4.0],
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
                                responsive: true,
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
                    {/* Top Stocked Item */}
                    <Grid item xs={12}>
                        <Box display="flex" flexDirection="column">
                            <Typography variant="subtitle2" color="background.paper">Top Stocked Item</Typography>
                            <Typography variant="h6" fontWeight="bold" color="warning.main">Pens</Typography>
                            <Typography variant="caption" color="background.paper">Total: 1,230 units</Typography>
                        </Box>
                    </Grid>

                    {/* Least Stocked Item */}
                    <Grid item xs={12}>
                        <Box display="flex" flexDirection="column">
                            <Typography variant="subtitle2" color="background.paper">Least Stocked Item</Typography>
                            <Typography variant="h6" fontWeight="bold" color="error.main">Scanners</Typography>
                            <Typography variant="caption" color="background.paper">Remaining: 3 units</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>
        </Grid>
    </>
    )
}

export default RequestRating
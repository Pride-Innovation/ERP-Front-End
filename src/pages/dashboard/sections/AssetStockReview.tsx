import { Box, Card, CardContent, Grid, Typography } from "@mui/material"
import { Bar } from "react-chartjs-2"


const monthlyAssetStationeryData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
        {
            label: 'Assets',
            data: [20, 30, 25, 40, 35, 45, 70, 100, 110, 150, 180, 220],
            backgroundColor: '#4caf50',
            stack: 'combined',
        },
        {
            label: 'Stationery',
            data: [30, 30, 45, 15, 40, 40, 80, 100, 110, 150, 170, 180],
            backgroundColor: '#E0E0E0',
            stack: 'combined',
        },
    ],
};

const AssetStockReview = () => {
    return (
        <>
            <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Asset Stock Reviews</Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ border: '1px solid #ddd', px: 1.5, py: 0.5, borderRadius: 2 }}>
                                1 year
                            </Typography>
                        </Box>

                        {/* Review Count */}
                        <Box display="flex" justifyContent="space-between" gap={4} mb={2}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Total Reviews</Typography>
                                <Typography variant="h4" fontWeight="bold">3,431</Typography>
                            </Box>
                            <Box bgcolor={"success.main"} p={2} borderRadius={1} textAlign="center">
                                <Typography variant="caption" color="warning.main">Since PatientPop</Typography>
                                <Typography variant="h6" fontWeight="bold" color="white">+1,725</Typography>
                            </Box>
                        </Box>

                        {/* Tab Legend (static UI mimic) */}
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Box width={12} height={12} borderRadius={0.5} bgcolor="#4caf50" />
                                <Typography variant="caption">Since PatientPop</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Box width={12} height={12} borderRadius={0.5} bgcolor="#E0E0E0" />
                                <Typography variant="caption">Reviews</Typography>
                            </Box>
                        </Box>

                        {/* Bar Chart */}
                        <Box height={"100%"} sx={{ bgcolor: "#f5f8fc" }}>
                            <Bar
                                data={monthlyAssetStationeryData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'top' },
                                        tooltip: {
                                            mode: 'index',
                                            intersect: false,
                                        },
                                    },
                                    scales: {
                                        x: {
                                            stacked: true,
                                            ticks: { color: '#999' },
                                            grid: { display: false },
                                        },
                                        y: {
                                            stacked: true,
                                            ticks: { color: '#999' },
                                            grid: { color: '#eee' },
                                            min: 0,
                                            max: 500, // Adjust based on your needs
                                        },
                                    },
                                }}
                            />

                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </>
    )
}

export default AssetStockReview
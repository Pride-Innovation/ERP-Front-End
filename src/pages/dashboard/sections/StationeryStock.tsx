import { Box, Card, CardContent, Grid, Typography } from "@mui/material"
import { Doughnut } from "react-chartjs-2";


const stationeryData = {
    labels: ['Books', 'Pens', 'Loan Forms', 'Others'],
    datasets: [
        {
            data: [300, 150, 100, 50],
            backgroundColor: ['#0A796C', '#FFA000', '#CACACA', '#ab47bc'],
            borderColor: ['#ffffff'],
            borderWidth: 2,
        },
    ],
};

const stationeryOptions = {
    cutout: '80%',
    plugins: {
        legend: {
            display: true,
            position: 'bottom' as const,
            labels: {
                boxWidth: 12,
                padding: 20,
            },
        },
    },
};

const StationeryStock = () => {
    return (
        <>
            <Grid item xs={12} md={3}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Stationery Stock – {new Date().toLocaleDateString('en-US', { month: 'long' })}
                        </Typography>

                        <Box display="flex" justifyContent="center" mt={2} mb={1}>
                            <Box width={250} height={250}>
                                <Doughnut data={stationeryData} options={stationeryOptions} />
                            </Box>
                        </Box>

                        <Box mt={2} px={1}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Current Month Distribution:
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={0.5}>
                                <Box display="flex" justifyContent="space-between">
                                    <Box display={"flex"} alignItems="center" gap={1}>
                                        <Typography variant="body2" color="text.primary" fontWeight={500}>
                                            Books
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            (dozen)
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight="bold" color="primary.main">300</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Box display={"flex"} alignItems="center" gap={1}>
                                        <Typography variant="body2" color="text.primary" fontWeight={500}>
                                            Pens
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            (boxes)
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight="bold" color="warning.main">150</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Box display={"flex"} alignItems="center" gap={1}>
                                        <Typography variant="body2" color="text.primary" fontWeight={500}>
                                            Loan Forms
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            (dozen)
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight="bold" color="#42a5f5">100</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.primary">Others</Typography>
                                    <Typography variant="body2" fontWeight="bold" color="#ab47bc">50</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </>
    )
}

export default StationeryStock
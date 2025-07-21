import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography
} from "@mui/material"
import { Bar } from "react-chartjs-2"
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import SectionUtills from "./utills";
import { useContext, useEffect } from "react";
import { DashboardContext } from "../../../context/dashboard";


const AssetStockReview = () => {
    const {
        monthlyItStats,
        monthlyOfficeStats,
        monthlyItAndOfficeStatslabels
    } = useContext(DashboardContext);
    const { getMonthlyItAndOfficeStatsFxn } = SectionUtills();
    useEffect(() => { getMonthlyItAndOfficeStatsFxn(); }, []);

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

                        <Box display="flex" justifyContent="space-between" gap={4} mb={2}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">IT Assets Total</Typography>
                                <Typography variant="h4" fontWeight="bold">
                                    + {monthlyItStats.reduce((acc, curr) => acc + curr, 0)}
                                </Typography>
                            </Box>
                            <Box bgcolor={"success.main"} p={2} borderRadius={1} textAlign="center">
                                <Typography variant="caption" color="warning.main">Office Assets Total</Typography>
                                <Typography variant="h6" fontWeight="bold" color="white">+ {monthlyOfficeStats.reduce((acc, curr) => acc + curr, 0)
                                }</Typography>
                            </Box>
                        </Box>

                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <AssessmentOutlinedIcon sx={{ color: '#1976D2' }} />
                                <Typography variant="caption" color="secondary.main">Yearly Asset Stock Report</Typography>
                            </Box>
                        </Box>

                        <Box height={"100%"} sx={{ bgcolor: "#f5f8fc" }}>
                            <Bar
                                data={{
                                    labels: monthlyItAndOfficeStatslabels,
                                    datasets: [
                                        {
                                            label: 'Office Assets',
                                            data: monthlyOfficeStats,
                                            backgroundColor: '#4caf50',
                                            stack: 'combined',
                                        },
                                        {
                                            label: 'IT Assets',
                                            data: monthlyItStats,
                                            backgroundColor: '#E0E0E0',
                                            stack: 'combined',
                                        },
                                    ],
                                }}
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
                                            max: 100,
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
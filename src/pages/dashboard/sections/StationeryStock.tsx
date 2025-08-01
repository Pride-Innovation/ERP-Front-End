import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography
} from "@mui/material"
import { Doughnut } from "react-chartjs-2";
import SectionUtills from "./utills";
import { useContext, useEffect } from "react";
import { DashboardContext } from "../../../context/dashboard";

const StationeryStock = () => {
    const { getMonthlyStationeryTotals } = SectionUtills();
    const { monthlyStationeryStats, monthlyStationeryStatslabels } = useContext(DashboardContext);

    useEffect(() => { getMonthlyStationeryTotals() }, []);
    return (
        <>
            <Grid item xs={12} md={3}>
                <Card sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="subtitle2"
                            color="text.secondary"
                            gutterBottom>
                            Stationery Stock
                            {/* – {new Date().toLocaleDateString('en-US', { month: 'long' })} */}
                        </Typography>

                        <Box display="flex" justifyContent="center" mt={2} mb={1}>
                            <Box width={250} height={250}>
                                <Doughnut data={
                                    {
                                        labels: monthlyStationeryStatslabels,
                                        datasets: [
                                            {
                                                data: monthlyStationeryStats,
                                                backgroundColor: ['#0A796C', '#FFA000', '#42a5f5', '#ab47bc'],
                                                borderColor: ['#ffffff'],
                                                borderWidth: 2,
                                            },
                                        ],
                                    }
                                } options={
                                    {
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
                                    }
                                } />
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
                                            {monthlyStationeryStatslabels[0]}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            (dozen)
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                                        {monthlyStationeryStats[0]}
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Box display={"flex"} alignItems="center" gap={1}>
                                        <Typography variant="body2" color="text.primary" fontWeight={500}>
                                            {monthlyStationeryStatslabels[1]}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            (boxes)
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight="bold" color="warning.main">
                                        {monthlyStationeryStats[1]}
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Box display={"flex"} alignItems="center" gap={1}>
                                        <Typography variant="body2" color="text.primary" fontWeight={500}>
                                            {monthlyStationeryStatslabels[2]}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            (dozen)
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight="bold" color="#42a5f5">
                                        {monthlyStationeryStats[2]}
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.primary">
                                        Others
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold" color="#ab47bc">
                                        {monthlyStationeryStats[3]}
                                    </Typography>
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
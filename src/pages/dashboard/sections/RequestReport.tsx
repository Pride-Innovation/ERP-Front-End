import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Typography
} from "@mui/material"
import SectionUtills from "./utills";
import { useContext, useEffect } from "react";
import { DashboardContext } from "../../../context/dashboard";


interface RequestCardProps {
    title: string;
    value: string;
    completed: string;
    pending: string;
    image: string;
    imageSize: number;
    progressColor: string;
    totalRequested: number;
    totalDelivered: number;
}

const RequestCard: React.FC<RequestCardProps> = ({
    title,
    value,
    completed,
    pending,
    image,
    imageSize,
    progressColor,
    totalRequested,
    totalDelivered
}) => {
    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ border: '1px solid #ddd', px: 1.5, py: 0.5, borderRadius: 2 }}>
                        1 year
                    </Typography>
                </Box>
                <Box display="flex" justifyContent="center" alignItems="center" mt={2} mb={2}>
                    <Box position="relative" display="inline-flex">
                        <CircularProgress
                            variant="determinate"
                            value={100}
                            size={140}
                            thickness={2}
                            sx={{
                                position: "absolute",
                                color: "#e0e0e0",
                            }}
                        />

                        <CircularProgress
                            variant="determinate"
                            value={(totalDelivered / totalRequested) * 100}
                            size={140}
                            thickness={2}
                            sx={{
                                color: progressColor,
                            }}
                        />

                        <Box
                            top={0}
                            left={0}
                            bottom={0}
                            right={0}
                            position="absolute"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            flexDirection="column"
                        >
                            <Box
                                component="img"
                                src={image}
                                alt="Request Icon"
                                width={imageSize}
                                height={imageSize}
                                mb={0.5}
                            />
                            <Typography variant="subtitle1" fontWeight="bold">
                                {value}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Requests
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" px={1}>
                    <Typography variant="body2" color="primary">
                        Completed: {completed}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Pending: {pending}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

const RequestReport: React.FC = () => {
    const { getCurrentYearRequestSummary } = SectionUtills()
    const { yearlyRequestSummaryStats } = useContext(DashboardContext);
    useEffect(() => { getCurrentYearRequestSummary() }, []);

    return (
        <Grid item xs={12} md={3}>
            {yearlyRequestSummaryStats.length > 0 &&
                yearlyRequestSummaryStats.map((card, index) => (
                    <RequestCard key={index} {...card} />
                ))}
        </Grid>
    );
};

export default RequestReport;
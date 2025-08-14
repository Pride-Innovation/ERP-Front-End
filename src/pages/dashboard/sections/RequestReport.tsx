import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Typography,
    alpha,
    Divider
} from "@mui/material";
import SectionUtills from "./utills";
import { useContext, useEffect } from "react";
import { DashboardContext } from "../../../context/dashboard";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Primary brand colors
const PRIMARY_COLOR = '#08796C'; // Teal
const SECONDARY_COLOR = '#BC892C'; // Gold

// Complementary colors for better visual hierarchy
const SUCCESS_COLOR = '#2e7d32'; // Green
const NEUTRAL_COLOR = '#5f6368'; // Gray

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
    // Calculate percentage with safety check
    const safeRequested = totalRequested || 1; // Prevent division by zero
    const percentage = Math.round((totalDelivered / safeRequested) * 100);

    // Color safety check - ensure we have a valid color
    const safeColor = (() => {
        // If it's a valid hex color or starts with rgb/hsl, use it
        if (/^#([A-Fa-f0-9]{3,6})|rgb|hsl|rgba|hsla/.test(progressColor)) {
            return progressColor;
        }

        // Check if it's one of our predefined colors
        if (progressColor === 'primary') return PRIMARY_COLOR;
        if (progressColor === 'secondary') return SECONDARY_COLOR;
        if (progressColor === 'success') return SUCCESS_COLOR;
        if (progressColor === 'neutral') return NEUTRAL_COLOR;

        // Default fallback color
        return PRIMARY_COLOR;
    })();

    return (
        <Card
            elevation={0}
            sx={{
                mb: 2.5,
                borderRadius: 1,
                border: `1px solid ${alpha('#000', 0.08)}`,
                boxShadow: `0 1px 3px ${alpha('#000', 0.1)}, 0 1px 2px ${alpha('#000', 0.06)}`,
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    boxShadow: `0 4px 12px ${alpha('#000', 0.08)}`,
                    transform: 'translateY(-2px)'
                }
            }}
        >
            {/* Card Header with title and time period */}
            <Box
                sx={{
                    px: 2.5,
                    py: 2,
                    borderBottom: `1px solid ${alpha('#000', 0.06)}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: alpha(safeColor, 0.03)
                }}
            >
                <Box>
                    <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        color="text.primary"
                    >
                        {title}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: alpha('#000', 0.04),
                        border: `1px solid ${alpha('#000', 0.08)}`
                    }}
                >
                    <CalendarTodayIcon sx={{ fontSize: '0.875rem', mr: 0.7, color: NEUTRAL_COLOR }} />
                    <Typography
                        variant="caption"
                        fontWeight={500}
                        color="text.secondary"
                    >
                        1 year
                    </Typography>
                </Box>
            </Box>

            <CardContent sx={{ p: 2.5 }}>
                {/* Progress Circle */}
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    my={2}
                    position="relative"
                >
                    {/* Background light ring */}
                    <Box
                        sx={{
                            position: 'absolute',
                            width: 156,
                            height: 156,
                            borderRadius: '50%',
                            bgcolor: alpha(safeColor, 0.04),
                            border: `1px solid ${alpha(safeColor, 0.1)}`
                        }}
                    />

                    <Box position="relative" display="inline-flex">
                        {/* Background circle */}
                        <CircularProgress
                            variant="determinate"
                            value={100}
                            size={140}
                            thickness={4}
                            sx={{
                                position: "absolute",
                                color: alpha(safeColor, 0.15),
                            }}
                        />

                        {/* Progress circle */}
                        <CircularProgress
                            variant="determinate"
                            value={percentage}
                            size={140}
                            thickness={4}
                            sx={{
                                color: safeColor,
                                boxShadow: `0 0 10px ${alpha(safeColor, 0.2)}`,
                                borderRadius: '50%'
                            }}
                        />

                        {/* Center content */}
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
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    bgcolor: alpha(safeColor, 0.1),
                                    mb: 1.5,
                                    p: 1.5
                                }}
                            >
                                <Box
                                    component="img"
                                    src={image}
                                    alt="Request Icon"
                                    sx={{
                                        width: imageSize,
                                        height: imageSize,
                                        objectFit: "contain",
                                        filter: `drop-shadow(0 2px 3px ${alpha(safeColor, 0.3)})`
                                    }}
                                />
                            </Box>
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                sx={{
                                    color: safeColor
                                }}
                            >
                                {value}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ my: 2, borderColor: alpha('#000', 0.06) }} />

                {/* Stats Footer - Completed and Pending counts */}
                <Grid container spacing={1}>
                    {/* Completed Stats */}
                    <Grid item xs={6}>
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: alpha(SUCCESS_COLOR, 0.08),
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                height: '100%'
                            }}
                        >
                            <Box
                                display="flex"
                                alignItems="center"
                                sx={{ mb: 1 }}
                            >
                                <CheckCircleOutlineIcon sx={{ fontSize: '1rem', color: SUCCESS_COLOR, mr: 0.7 }} />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 500,
                                        color: SUCCESS_COLOR
                                    }}
                                >
                                    Completed
                                </Typography>
                            </Box>
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{
                                    color: SUCCESS_COLOR
                                }}
                            >
                                {completed}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Pending Stats */}
                    <Grid item xs={6}>
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: alpha(NEUTRAL_COLOR, 0.08),
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                height: '100%'
                            }}
                        >
                            <Box
                                display="flex"
                                alignItems="center"
                                sx={{ mb: 1 }}
                            >
                                <HourglassEmptyIcon sx={{ fontSize: '1rem', color: NEUTRAL_COLOR, mr: 0.7 }} />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 500,
                                        color: NEUTRAL_COLOR
                                    }}
                                >
                                    Pending
                                </Typography>
                            </Box>
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                color={NEUTRAL_COLOR}
                            >
                                {pending}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}

const RequestReport: React.FC<{ size?: number }> = (
    { size = 4 }
) => {
    const { getCurrentYearRequestSummary } = SectionUtills()
    const { yearlyRequestSummaryStats } = useContext(DashboardContext);

    useEffect(() => { getCurrentYearRequestSummary() }, []);

    return (
        <Grid item xs={12} md={size}>
            {yearlyRequestSummaryStats.length > 0 ?
                yearlyRequestSummaryStats.map((card, index) => (
                    <RequestCard key={index} {...card} />
                )) : (
                    <Card
                        elevation={0}
                        sx={{
                            height: 300,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            border: `1px solid ${alpha('#000', 0.08)}`
                        }}
                    >
                        <CircularProgress size={24} sx={{ color: PRIMARY_COLOR }} />
                    </Card>
                )
            }
        </Grid>
    );
};

export default RequestReport;
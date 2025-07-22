import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Typography
} from "@mui/material"
import furnitureImage from "../../../statics/images/furnitureDesktop.png";
import stationeryImage from "../../../statics/images/stationeryDesktop.png";
import RequestImage from "../../../statics/images/requestDesktop.png"


interface RequestCardProps {
    title: string;
    value: string;
    completed: string;
    pending: string;
    image: string;
    imageSize: number;
    progressColor: string;
}

const RequestCard: React.FC<RequestCardProps> = ({
    title,
    value,
    completed,
    pending,
    image,
    imageSize,
    progressColor,
}) => (
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
                        value={70}
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

const RequestReport: React.FC = () => {
    const cardData: RequestCardProps[] = [
        {
            title: "IT Asset Requests",
            image: RequestImage,
            imageSize: 40,
            value: "9,245",
            completed: "5.9k",
            pending: "3.1k",
            progressColor: "#1976d2",
        },
        {
            title: "Office Asset Requests",
            image: furnitureImage,
            imageSize: 60,
            value: "9,245",
            completed: "5.9k",
            pending: "3.1k",
            progressColor: "#ab47bc",
        },
        {
            title: "Stationery Requests",
            image: stationeryImage,
            imageSize: 40,
            value: "9,245",
            completed: "5.9k",
            pending: "3.1k",
            progressColor: "secondary.main",
        },
    ];

    return (
        <Grid item xs={12} md={3}>
            {cardData.map((card, index) => (
                <RequestCard key={index} {...card} />
            ))}
        </Grid>
    );
};

export default RequestReport;
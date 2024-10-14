import { Box, Card, Typography } from "@mui/material";
import { IDashboardCard } from "./interface";
import { blue } from "@mui/material/colors";

const DashboardCard = ({
    name,
    number,
    image,
    stockLevel,
    lastUpdated
}: IDashboardCard) => {
    let stockColor;
    let stockStatus;

    if (stockLevel === 'low') {
        stockColor = 'red';
        stockStatus = 'Required';
    } else if (stockLevel === 'average') {
        stockColor = 'orange';
        stockStatus = 'Average Stock';
    } else {
        stockColor = 'green';
        stockStatus = 'Plenty in Stock';
    }

    return (
        <Card
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: "8px",
                bgcolor: 'linear-gradient(135deg, #e3f2fd 30%, #64b5f6 100%)',
                transition: '0.3s',
                flex: 1,
                '&:hover': {
                    opacity: 0.9,
                },
                p: 2,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <Box
                    component="img"
                    src={image}
                    alt={`${name} Icon`}
                    sx={{ width: 50, height: 50, mr: 2, borderRadius: "8px", bgcolor: blue[100], p: 1 }}
                />
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0d47a1' }}>
                        {name}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {number}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Last updated: {lastUpdated}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: stockColor, fontWeight: 'bold', mt: 0.5 }}
                    >
                        {stockStatus}
                    </Typography>
                </Box>
            </Box>
            <Box
                sx={{
                    bgcolor: '#ffffff',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${stockColor}`,
                }}
            >
                <Typography sx={{ fontSize: "20px" }} variant="caption" color={stockColor}>
                    !
                </Typography>
            </Box>
        </Card>
    );
};

export default DashboardCard;

import { Box, Card, Typography } from "@mui/material";
import { IDashboardCard } from "./interface";
import { blue } from "@mui/material/colors";
import DashBoardUtills from "./utills";

const style = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    bgcolor: 'linear-gradient(135deg, #e3f2fd 30%, #64b5f6 100%)',
    transition: '0.3s',
    flex: 1,
    '&:hover': {
        opacity: 0.9,
    },
    p: 2,
    boxShadow: 3
}

const DashboardCard: React.FC<IDashboardCard> = ({
    name,
    number,
    image,
    stockLevel,
    lastUpdated
}) => {
    const { getStockDetails, StockIndicator } = DashBoardUtills()
    const { color: stockColor, status: stockStatus } = getStockDetails(stockLevel);

    return (
        <Card
            sx={style}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <Box
                    component="img"
                    src={image}
                    alt={`${name} Icon`}
                    sx={{ width: 50, height: 50, mr: 2, borderRadius: "8px", bgcolor: blue[100], p: 1 }}
                />
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: blue[900] }}>
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
            <StockIndicator color={stockColor} />
        </Card>
    );
};

export default DashboardCard;

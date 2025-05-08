/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Card, Typography, useTheme } from "@mui/material";
import { IDashboardCard } from "./interface";
import DashBoardUtills from "./utills";

const DashboardCard: React.FC<IDashboardCard> = ({
    name,
    number,
    image,
    stockLevel,
    lastUpdated
}) => {
    const theme = useTheme();
    const { getStockDetails, StockIndicator } = DashBoardUtills();
    const { color: stockColor, status: stockStatus } = getStockDetails(stockLevel);

    return (
        <Card
            elevation={3}
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 3,
                background: 'linear-gradient(135deg, #FFFDF7, #F4F1EC)',
                borderRadius: 3,
                height: '100%',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                    transform: 'scale(1.015)',
                },
            }}
        >
            {/* Left side with image and info */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <Box
                    component="img"
                    src={image}
                    alt={`${name} Icon`}
                    sx={{
                        width: 56,
                        height: 56,
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: '#08796C10',
                        mr: 2,
                    }}
                />
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#08796C' }}>
                        {name}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                        Total: {number}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Last updated: {lastUpdated}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ mt: 0.5, color: stockColor, fontWeight: 600 }}
                    >
                        {stockStatus}
                    </Typography>
                </Box>
            </Box>

            {/* Right side stock indicator */}
            <StockIndicator color={stockColor} />
        </Card>
    );
};

export default DashboardCard;

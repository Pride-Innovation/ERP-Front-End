/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { alpha, Box, Card, Typography } from "@mui/material";
import { IDashboardCard } from "./interface";
import DashBoardUtills from "./utills";

const DashboardCard: React.FC<IDashboardCard> = ({
    name,
    number,
    image,
    stockLevel,
    lastUpdated
}) => {
    const { getStockDetails, StockIndicator } = DashBoardUtills();
    const { color: stockColor, status: stockStatus } = getStockDetails(stockLevel);

    return (
        <Card
            elevation={0}
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2.5,
                bgcolor: "#ffffff",
                borderRadius: 2.5,
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                height: '100%',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    bgcolor: '#08796C',
                    borderRadius: '4px 0 0 4px',
                },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 2 }}>
                <Box
                    component="img"
                    src={image}
                    alt={`${name} Icon`}
                    sx={{
                        width: 52,
                        height: 52,
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: alpha('#08796C', 0.08),
                        objectFit: 'cover',
                        flexShrink: 0,
                    }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 500,
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            mb: 0.3,
                        }}
                    >
                        {name}
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: '#111827',
                            lineHeight: 1.2,
                            mb: 0.5,
                        }}
                    >
                        {number}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: stockColor,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                            }}
                        >
                            {stockStatus}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                            · {lastUpdated}
                        </Typography>
                    </Box>
                </Box>
            </Box>
            <StockIndicator color={stockColor} />
        </Card>
    );
};

export default DashboardCard;

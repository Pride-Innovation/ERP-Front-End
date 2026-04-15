/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    alpha,
    Box,
    Typography,
    Stack,
    Paper,
    Grid,
} from '@mui/material';
import { useContext, useEffect } from 'react';
import { RequestContext } from '../../context/request/RequestContext';
import { formatNumberWithCommas } from './helper';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';

// Use the same color constants as in StockItems
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

// Currency symbol (can be made configurable if needed)
const CURRENCY = 'UGX';

const PriceTotals = () => {
    const {
        stockRows,
        setTotalCostPrice,
        setTotalPurchasePrice,
        totalCostPrice,
        totalPurchasePrice
    } = useContext(RequestContext);

    const calculateTotalCostPrice = () => {
        setTotalCostPrice(stockRows.reduce((acc, cur) => (acc + (Number(cur.costPrice) || 0)), 0));
    };

    const calculateTotalPurchasePrice = () => {
        setTotalPurchasePrice(stockRows.reduce((acc, cur) => (acc + (Number(cur.purchasePrice) || 0)), 0));
    };

    useEffect(() => {
        calculateTotalCostPrice();
        calculateTotalPurchasePrice();
    }, [stockRows]);

    return (
        <Grid
            container
            spacing={3}
            justifyContent="space-between"
            alignItems="center"
        >
            <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 500,
                            color: 'text.secondary',
                        }}
                    >
                        {stockRows.length} item{stockRows.length !== 1 ? 's' : ''} in inventory
                    </Typography>

                    {stockRows.some(row =>
                        !row.name ||
                        !row.assetTypeId ||
                        row.orderedQuantity === 0
                    ) && (
                            <Typography
                                variant="caption"
                                color="error"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    bgcolor: alpha('#f44336', 0.1),
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                }}
                            >
                                Some items are incomplete
                            </Typography>
                        )}
                </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
                >
                    {/* Cost Price Total */}
                    <Paper
                        elevation={0}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 2.5,
                            py: 1.5,
                            borderRadius: 2,
                            border: `1px solid ${alpha(PRIMARY_COLOR, 0.2)}`,
                            bgcolor: alpha(PRIMARY_COLOR, 0.05),
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                boxShadow: `0 2px 8px ${alpha(PRIMARY_COLOR, 0.15)}`,
                                bgcolor: alpha(PRIMARY_COLOR, 0.08),
                            },
                            minWidth: { xs: '100%', md: 220 }
                        }}
                    >
                        <AccountBalanceWalletOutlinedIcon
                            sx={{
                                color: PRIMARY_COLOR,
                                mr: 1.5,
                                fontSize: 20
                            }}
                        />
                        <Box>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                    display: 'block',
                                    lineHeight: 1.2
                                }}
                            >
                                Total Cost Price
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: 16,
                                    color: PRIMARY_COLOR,
                                    mt: 0.3
                                }}
                            >
                                {CURRENCY} {formatNumberWithCommas(totalCostPrice || 0)}
                            </Typography>
                        </Box>
                    </Paper>

                    {/* Purchase Price Total */}
                    <Paper
                        elevation={0}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            px: 2.5,
                            py: 1.5,
                            borderRadius: 2,
                            border: `1px solid ${alpha(SECONDARY_COLOR, 0.2)}`,
                            bgcolor: alpha(SECONDARY_COLOR, 0.05),
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                boxShadow: `0 2px 8px ${alpha(SECONDARY_COLOR, 0.15)}`,
                                bgcolor: alpha(SECONDARY_COLOR, 0.08),
                            },
                            minWidth: { xs: '100%', md: 220 }
                        }}
                    >
                        <ShoppingBasketOutlinedIcon
                            sx={{
                                color: SECONDARY_COLOR,
                                mr: 1.5,
                                fontSize: 20
                            }}
                        />
                        <Box>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                    display: 'block',
                                    lineHeight: 1.2
                                }}
                            >
                                Total Purchase Price
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: 16,
                                    color: SECONDARY_COLOR,
                                    mt: 0.3
                                }}
                            >
                                {CURRENCY} {formatNumberWithCommas(totalPurchasePrice || 0)}
                            </Typography>
                        </Box>
                    </Paper>
                </Stack>
            </Grid>
        </Grid>
    );
};

export default PriceTotals;
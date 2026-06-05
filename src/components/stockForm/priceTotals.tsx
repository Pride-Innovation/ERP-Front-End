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
} from '@mui/material';
import { useContext, useEffect } from 'react';
import { RequestContext } from '../../context/request/RequestContext';
import { formatNumberWithCommas } from './helper';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { brand, gold, neutral, border, status } from '../../utils/tokens';

// Currency symbol (can be made configurable if needed)
const CURRENCY = 'UGX';

interface TotalCardProps {
    label: string;
    value: number;
    accent: string;
    icon: React.ReactNode;
}

const TotalCard = ({ label, value, accent, icon }: TotalCardProps) => (
    <Paper
        elevation={0}
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.25,
            borderRadius: 2,
            border: `1px solid ${border.subtle}`,
            bgcolor: '#fff',
            minWidth: { xs: '100%', md: 230 },
        }}
    >
        <Box
            sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(accent, 0.1),
                color: accent,
                '& .MuiSvgIcon-root': { fontSize: 20 },
            }}
        >
            {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography
                sx={{
                    color: neutral[500],
                    fontWeight: 600,
                    fontSize: '0.62rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    lineHeight: 1.2,
                }}
            >
                {label}
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: neutral[900], lineHeight: 1.25, mt: 0.25 }}>
                <Box component="span" sx={{ fontSize: '0.7rem', fontWeight: 700, color: neutral[400], mr: 0.5 }}>
                    {CURRENCY}
                </Box>
                {formatNumberWithCommas(value || 0)}
            </Typography>
        </Box>
    </Paper>
);

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

    const hasIncomplete = stockRows.some(row =>
        !row.name || !row.assetTypeId || row.orderedQuantity === 0
    );

    return (
        <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
        >
            {/* Left — item count + completeness hint */}
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="body2" sx={{ fontWeight: 600, color: neutral[700] }}>
                    {stockRows.length} item{stockRows.length !== 1 ? 's' : ''} in this delivery
                </Typography>

                {hasIncomplete && (
                    <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{
                            px: 1,
                            py: 0.4,
                            borderRadius: 1,
                            bgcolor: status.warning.soft,
                            color: status.warning.strong,
                            border: `1px solid ${alpha(status.warning.main, 0.3)}`,
                        }}
                    >
                        <InfoOutlinedIcon sx={{ fontSize: 14 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Some items are incomplete
                        </Typography>
                    </Stack>
                )}
            </Stack>

            {/* Right — totals */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
            >
                <TotalCard
                    label="Total Cost Price"
                    value={totalCostPrice}
                    accent={brand[500]}
                    icon={<AccountBalanceWalletOutlinedIcon />}
                />
                <TotalCard
                    label="Total Purchase Price"
                    value={totalPurchasePrice}
                    accent={gold[500]}
                    icon={<ShoppingBasketOutlinedIcon />}
                />
            </Stack>
        </Stack>
    );
};

export default PriceTotals;

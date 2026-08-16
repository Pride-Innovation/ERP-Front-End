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
            gap: 2,
            px: 2.5,
            py: 1.75,
            borderRadius: '8px',
            border: `1.5px solid ${alpha(accent, 0.2)}`,
            bgcolor: '#fff',
            minWidth: { xs: '100%', md: 270 },
        }}
    >
        <Box
            sx={{
                width: 48,
                height: 48,
                borderRadius: '8px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(accent, 0.08),
                color: accent,
                '& .MuiSvgIcon-root': { fontSize: 24 },
            }}
        >
            {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
                sx={{
                    color: neutral[500],
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    lineHeight: 1.2,
                    mb: 0.5,
                }}
            >
                {label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography
                    sx={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: accent,
                    }}
                >
                    {CURRENCY}
                </Typography>
                <Typography
                    sx={{
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        color: neutral[900],
                        lineHeight: 1.2,
                    }}
                >
                    {formatNumberWithCommas(value || 0)}
                </Typography>
            </Box>
        </Box>
    </Paper>
);

interface PriceTotalsProps {
    showPrices?: boolean;
}

const PriceTotals = ({ showPrices = false }: PriceTotalsProps) => {
    const {
        stockRows,
        setTotalCostPrice,
        setTotalPurchasePrice,
        totalCostPrice,
        totalPurchasePrice
    } = useContext(RequestContext);

    /**
     * Extended totals: the table captures a *unit* price, so a total is only meaningful once it is
     * multiplied by the quantity. These previously summed the unit prices alone, which understated
     * every stock — and because the backend stores whatever the client sends, the wrong figure was
     * persisted and carried through to exports, asset records and the printed GRN.
     *
     * <p>Quantity is the *ordered* one, not delivered, so the total states the value the order
     * commits to and stays stable as goods arrive in batches. A delivered-based total would drop on
     * a partial delivery and then never recover, since receiving a top-up doesn't recalculate it.
     *
     * <p>Purchase Price: If not explicitly set, uses Cost Price as the value. This ensures totals
     * are always meaningful and match user intent when only one pricing column is visible.
     */
    useEffect(() => {
        const extend = (price: number | string | undefined, qty: number | undefined) =>
            (Number(price) || 0) * (Number(qty) || 0);

        setTotalCostPrice(stockRows.reduce((acc, cur) => acc + extend(cur.costPrice, cur.orderedQuantity), 0));

        // Purchase Price uses Cost Price as fallback if not explicitly set
        setTotalPurchasePrice(
            stockRows.reduce((acc, cur) => {
                const priceToUse = cur.purchasePrice || cur.costPrice;
                return acc + extend(priceToUse, cur.orderedQuantity);
            }, 0)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stockRows]);

    const hasIncomplete = stockRows.some(row =>
        !row.name || !row.assetTypeId || row.orderedQuantity === 0
    );

    return (
        <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'flex-start' }}
        >
            {/* Left — item count + completeness hint */}
            <Stack direction="column" spacing={1.75} flex={1}>
                <Box>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 700,
                            color: neutral[900],
                            fontSize: '1.05rem',
                            mb: 0.5,
                        }}
                    >
                        {stockRows.length} item{stockRows.length !== 1 ? 's' : ''} in this delivery
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: neutral[500],
                            fontSize: '0.8rem',
                            fontWeight: 500,
                        }}
                    >
                        Totals are unit price × ordered qty
                    </Typography>
                </Box>

                {hasIncomplete && (
                    <Box
                        sx={{
                            display: 'inline-flex',
                            px: 1.5,
                            py: 0.75,
                            borderRadius: '8px',
                            bgcolor: status.warning.soft,
                            border: `1.5px solid ${alpha(status.warning.main, 0.3)}`,
                            width: 'fit-content',
                        }}
                    >
                        <Stack direction="row" spacing={0.75} alignItems="center">
                            <InfoOutlinedIcon
                                sx={{
                                    fontSize: 16,
                                    color: status.warning.strong,
                                    flexShrink: 0,
                                }}
                            />
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 700,
                                    color: status.warning.strong,
                                    fontSize: '0.8rem',
                                }}
                            >
                                Some items are incomplete
                            </Typography>
                        </Stack>
                    </Box>
                )}
            </Stack>

            {/* Right — totals */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
            >
                <TotalCard
                    label="Total Cost Value"
                    value={totalCostPrice}
                    accent={brand[500]}
                    icon={<AccountBalanceWalletOutlinedIcon />}
                />
                {showPrices && (
                    <TotalCard
                        label="Total Purchase Value"
                        value={totalPurchasePrice}
                        accent={gold[500]}
                        icon={<ShoppingBasketOutlinedIcon />}
                    />
                )}
            </Stack>
        </Stack>
    );
};

export default PriceTotals;

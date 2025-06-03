import { alpha, Box, Typography } from '@mui/material'
import { useContext, useEffect } from 'react'
import { RequestContext } from '../../context/request/RequestContext';
import { formatNumberWithCommas } from './helper';

const PriceTotals = () => {
    const {
        stockRows,
        setTotalCostPrice,
        setTotalPurchasePrice,
        totalCostPrice,
        totalPurchasePrice
    } = useContext(RequestContext);

    const calculateTotalCostPrice = () => {
        setTotalCostPrice(stockRows.reduce((acc, cur) => (acc + (cur.costPrice as number)), 0))
    }
    const calculateTotalPurchasePrice = () => {
        setTotalPurchasePrice(stockRows.reduce((acc, cur) => (acc + (cur.purchasePrice as number)), 0))
    }

    useEffect(() => {
        calculateTotalCostPrice();
        calculateTotalPurchasePrice();
    }, [stockRows])

    return (
        <Box sx={{ display: "flex", ml: "auto", justifyContent: "flex-end" }}>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
                sx={{
                    bgcolor: alpha("#0A796C", 0.1),
                    p: 2,
                    py: 1,
                    borderRadius: 2,
                    border: `1px solid ${alpha("#0A796C", 0.3)}`,
                }}
            >
                <Typography
                    sx={{
                        fontWeight: 600,
                        fontSize: "14px",
                        textTransform: "capitalize",
                        color: "#0A796C", // consistent with transparent background
                    }}
                >
                    <span style={{ color: "#000", marginRight: "10px" }}>
                        Total Cost Price:
                    </span>
                    {formatNumberWithCommas(totalCostPrice)} UGX
                </Typography>
            </Box>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
                ml={3}
                sx={{
                    bgcolor: alpha("#0A796C", 0.1),
                    p: 2,
                    py: 1,
                    borderRadius: 2,
                    border: `1px solid ${alpha("#0A796C", 0.3)}`,
                }}
            >
                <Typography
                    sx={{
                        fontWeight: 600,
                        fontSize: "14px",
                        textTransform: "capitalize",
                        color: "#0A796C", // consistent with transparent background
                    }}
                >
                    <span style={{ color: "#000", marginRight: "10px" }}>
                        Total Purchase Price:
                    </span>
                    {formatNumberWithCommas(totalPurchasePrice)} UGX
                </Typography>
            </Box>

        </Box>
    )
}

export default PriceTotals

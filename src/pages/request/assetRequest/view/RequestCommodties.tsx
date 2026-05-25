import { useEffect, useState } from 'react';
import { Box, Typography, alpha, Paper, Chip, Divider } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { ICommodity } from '../../../settings/commodity/interface';

const TEAL = '#08796C';

const RequestCommodties = ({ requestCommodties }: {
    requestCommodties: Array<{
        commodity: ICommodity;
        quantity: number;
    }>;
}) => {
    if (!requestCommodties || requestCommodties.length === 0) {
        return (
            <Box
                sx={{
                    py: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    color: 'text.disabled',
                }}
            >
                <InventoryIcon sx={{ fontSize: 40, opacity: 0.4 }} />
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    No items requested
                </Typography>
            </Box>
        );
    }

    const total = requestCommodties.reduce((sum, c) => sum + c.quantity, 0);

    return (
        <Box>
            {/* Summary bar */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                    px: 0.5,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryOutlinedIcon sx={{ fontSize: 16, color: TEAL }} />
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                        {requestCommodties.length} item{requestCommodties.length !== 1 ? 's' : ''} requested
                    </Typography>
                </Box>
                <Chip
                    size="small"
                    label={`Total qty: ${total}`}
                    sx={{
                        bgcolor: alpha(TEAL, 0.08),
                        color: TEAL,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        height: 24,
                        border: `1px solid ${alpha(TEAL, 0.2)}`,
                    }}
                />
            </Box>

            {/* Table */}
            <Paper
                elevation={0}
                sx={{
                    border: `1px solid ${alpha('#000', 0.07)}`,
                    borderRadius: 2,
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr auto',
                        gap: 2,
                        px: 2.5,
                        py: 1.25,
                        bgcolor: alpha(TEAL, 0.04),
                        borderBottom: `1px solid ${alpha('#000', 0.07)}`,
                    }}
                >
                    {['Item', 'Category', 'Qty'].map((h) => (
                        <Typography
                            key={h}
                            variant="caption"
                            fontWeight={700}
                            color="text.disabled"
                            sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.68rem' }}
                        >
                            {h}
                        </Typography>
                    ))}
                </Box>

                {/* Rows */}
                {requestCommodties.map((item, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr auto',
                            gap: 2,
                            px: 2.5,
                            py: 1.5,
                            alignItems: 'center',
                            borderBottom: index < requestCommodties.length - 1
                                ? `1px solid ${alpha('#000', 0.05)}`
                                : 'none',
                            '&:hover': { bgcolor: alpha(TEAL, 0.015) },
                            transition: 'background 0.15s',
                        }}
                    >
                        <Box>
                            <Typography variant="body2" fontWeight={500} color="text.primary">
                                {item.commodity.name}
                            </Typography>
                            {item.commodity.groupName && (
                                <Typography variant="caption" color="text.secondary">
                                    {item.commodity.groupName}
                                </Typography>
                            )}
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                            {item.commodity.assetType?.name ?? '—'}
                        </Typography>

                        <Chip
                            size="small"
                            label={item.quantity}
                            sx={{
                                bgcolor: alpha(TEAL, 0.08),
                                color: TEAL,
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                minWidth: 36,
                                height: 24,
                                border: `1px solid ${alpha(TEAL, 0.18)}`,
                            }}
                        />
                    </Box>
                ))}
            </Paper>
        </Box>
    );
};

export default RequestCommodties;

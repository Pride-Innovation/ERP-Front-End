/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import {
    Box,
    Card,
    Typography,
    useTheme,
    Grid,
    LinearProgress,
    linearProgressClasses
} from '@mui/material';

import React from 'react';
import { IStore } from './interface';
import { styled } from '@mui/system';

interface BranchStoreReportProps {
    storeData: IStore[];
}

const StatusBar = styled(LinearProgress)<{ statuscolor: string }>(({ theme, statuscolor }) => ({
    height: 8,
    borderRadius: 5,
    [`& .${linearProgressClasses.bar}`]: {
        backgroundColor:
            statuscolor === 'error'
                ? theme.palette.error.main
                : statuscolor === 'warning'
                    ? theme.palette.warning.main
                    : theme.palette.primary.main,
    },
    backgroundColor: theme.palette.grey[300],
}));

const BranchStoreReport: React.FC<BranchStoreReportProps> = ({ storeData }) => {
    const theme = useTheme();

    const groupedByAssetType = storeData.reduce((acc: Record<string, IStore[]>, item) => {
        const assetTypeName = item?.commodity?.assetType?.name || 'Uncategorized';
        if (!acc[assetTypeName]) acc[assetTypeName] = [];
        acc[assetTypeName].push(item);
        return acc;
    }, {});

    const branch = storeData[0]?.branch;

    const getStatusColor = (quantity: number): 'primary' | 'warning' | 'error' => {
        if (quantity < 5) return 'error';
        if (quantity < 10) return 'warning';
        return 'primary';
    };

    return (
        <Box sx={{ p: 4, width: '100%' }}>
            <Card
                sx={{
                    mb: 4,
                    p: 3,
                    bgcolor: '#f5f7fa',
                    border: `1px solid ${theme.palette.primary.main}`,
                    boxShadow: 4,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h5" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                    Branch Store Report
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mt: 1 }}>
                    {branch?.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Email: {branch?.email} | Telephone: {branch?.telephone}
                </Typography>
            </Card>

            {Object.entries(groupedByAssetType).map(([assetTypeName, items]) => (
                <Box key={assetTypeName} sx={{ mb: 6 }}>
                    <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 600, mb: 2 }}>
                        {assetTypeName}
                    </Typography>
                    <Grid container spacing={3}>
                        {items.map((item) => {
                            const statusColor = getStatusColor(item.quantity);
                            return (
                                <Grid item xs={12} sm={6} md={4} key={item.id}>
                                    <Card
                                        sx={{
                                            p: 2.5,
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            bgcolor: 'white',
                                            borderRadius: 2,
                                            boxShadow: 2,
                                            borderTop: `4px solid ${theme.palette[statusColor].main}`,
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                {item.commodity.name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                                Group: {item.commodity.groupName}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                Quantity: <strong>{item.quantity}</strong>
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    mb: 0.5,
                                                    display: 'block',
                                                    color: theme.palette[statusColor].main,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {statusColor === 'error'
                                                    ? 'Critically Low Stock'
                                                    : statusColor === 'warning'
                                                        ? 'Low Stock Warning'
                                                        : 'Stock Sufficient'}
                                            </Typography>
                                            <StatusBar
                                                variant="determinate"
                                                value={Math.min(item.quantity, 100)}
                                                statuscolor={statusColor}
                                            />
                                        </Box>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            ))}
        </Box>
    );
};

export default BranchStoreReport;

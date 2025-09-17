/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Grid,
    Box,
    Typography,
    Divider,
    useTheme,
    alpha,
    Fade,
    CircularProgress,
    Alert
} from "@mui/material";
import ViewInventoryutills from "./utills";
import TableComponent from "../../../components/tables/TableComponent";
import { useEffect, useState } from "react";
import { IInventory, IStockCommodities } from "../interface";
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import CategoryIcon from '@mui/icons-material/Category';

const OtherDetails = ({ inventory }: { inventory: IInventory }) => {
    const {
        columnHeaders,
        endPoint,
        loading,
        header,
        stocksTableData,
        handleInventoryTableData
    } = ViewInventoryutills();

    const theme = useTheme();
    const [localLoading, setLocalLoading] = useState(true);
    const hasCommodities = inventory.commodities && inventory.commodities.length > 0;

    useEffect(() => {
        setLocalLoading(true);
        if (inventory.id && hasCommodities) {
            handleInventoryTableData(inventory.commodities as Array<IStockCommodities>);
        }
        // Add a small delay to make loading smoother
        setTimeout(() => setLocalLoading(false), 500);
    }, [inventory]);

    // Calculate total items
    const totalItems = stocksTableData?.reduce((sum, item) => sum + (item.deliveredQuantity || 0), 0) || 0;

    return (
        <Fade in={!localLoading}>
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ mb: 3 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: theme.palette.primary.main,
                            fontWeight: 500
                        }}
                    >
                        <CategoryIcon />
                        Inventory Commodities
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        All commodities included in this inventory delivery
                    </Typography>
                    <Divider sx={{ mt: 1.5 }} />
                </Box>

                {localLoading || loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={32} />
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {hasCommodities ? (
                            <>
                                {/* Summary Section */}
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                                            p: 2,
                                            borderRadius: 1,
                                            mb: 2
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <InventoryOutlinedIcon sx={{ color: theme.palette.primary.main }} />
                                            <Typography variant="subtitle1" fontWeight={500}>
                                                Total Items: {totalItems}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Unique Commodities: {stocksTableData?.length || 0}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Table Section */}
                                <Grid item xs={12}>
                                    <TableComponent
                                        endPoint={endPoint}
                                        loading={loading}
                                        count={100}
                                        exportData
                                        header={header}
                                        module="inventory commodities"
                                        rows={stocksTableData || []}
                                        columnHeaders={columnHeaders}
                                        paginationMode='server'
                                        // sx={{
                                        //     '& .MuiDataGrid-root': {
                                        //         border: 'none',
                                        //         borderRadius: 1,
                                        //         overflow: 'hidden',
                                        //         boxShadow: `0 0 0 1px ${alpha(theme.palette.divider, 0.1)}`
                                        //     }
                                        // }}
                                    />
                                </Grid>
                            </>
                        ) : (
                            <Grid item xs={12}>
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    No commodities found in this inventory.
                                </Alert>
                            </Grid>
                        )}
                    </Grid>
                )}
            </Box>
        </Fade>
    );
};

export default OtherDetails;
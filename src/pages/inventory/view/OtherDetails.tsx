/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Typography,
    Stack,
    Chip,
    alpha,
} from "@mui/material";
import ViewInventoryutills from "./utills";
import TableComponent from "../../../components/tables/TableComponent";
import { useEffect } from "react";
import { IInventory, IStockCommodities } from "../interface";
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { brand, neutral } from "../../../utils/tokens";

const OtherDetails = ({ inventory }: { inventory: IInventory }) => {
    const {
        columnHeaders,
        endPoint,
        loading,
        header,
        stocksTableData,
        handleInventoryTableData
    } = ViewInventoryutills();

    const hasCommodities = !!inventory.commodities && inventory.commodities.length > 0;

    useEffect(() => {
        if (inventory.id && hasCommodities) {
            handleInventoryTableData(inventory.commodities as Array<IStockCommodities>);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inventory]);

    const totalItems = stocksTableData?.reduce((sum, item) => sum + (item.deliveredQuantity || 0), 0) || 0;
    const uniqueCount = stocksTableData?.length || 0;

    return (
        <Box>
            {/* Section header */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1.5}
                sx={{ px: { xs: 2, md: 2.5 }, pt: { xs: 2, md: 2.5 }, pb: 1.5 }}
            >
                <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(brand[500], 0.1), color: brand[600], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: neutral[900] }}>
                            Stock Commodities
                        </Typography>
                        <Typography variant="caption" sx={{ color: neutral[500] }}>
                            Items received in this delivery
                        </Typography>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={1}>
                    <Chip
                        size="small"
                        label={`${totalItems.toLocaleString()} delivered`}
                        sx={{ height: 24, fontWeight: 700, fontSize: '0.72rem', bgcolor: alpha(brand[500], 0.08), color: brand[700] }}
                    />
                    <Chip
                        size="small"
                        label={`${uniqueCount} commodit${uniqueCount === 1 ? 'y' : 'ies'}`}
                        sx={{ height: 24, fontWeight: 600, fontSize: '0.72rem', bgcolor: alpha('#BC892C', 0.1), color: '#946C22' }}
                    />
                </Stack>
            </Stack>

            {hasCommodities ? (
                <TableComponent
                    endPoint={endPoint}
                    loading={loading}
                    exportData
                    flat
                    header={{ ...header, singular: "Inventory Commodity", plural: "Inventory Commodities" }}
                    module="inventory commodities"
                    rows={stocksTableData || []}
                    columnHeaders={columnHeaders}
                    paginationMode='client'
                />
            ) : (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Inventory2OutlinedIcon sx={{ fontSize: 40, color: neutral[300], mb: 1 }} />
                    <Typography variant="body2" sx={{ color: neutral[500] }}>
                        No commodities found in this inventory.
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default OtherDetails;

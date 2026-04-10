/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import TableComponent from '../../../../components/tables/TableComponent';
import { ICommodity } from '../../../settings/commodity/interface';
import { ITableHeader } from '../../../../components/tables/interface';
import { getTableHeaders } from '../../../../components/tables/getTableHeaders';
import { ICommodityTableData } from '../../interface';
import { Box, Typography, alpha, Paper } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';

// Brand colors
// const PRIMARY_COLOR = '#08796C';
// const SECONDARY_COLOR = '#BC892C';

const defaultCommodities: Array<{
    commodity: ICommodity
    quantity: number
}> = [
    {
        commodity: {
            id: 1,
            name: "Pens",
            groupName: "Box",
            assetType: {
                id: 3,
                name: "Stationery",
                description: "Stationery"
            }
        },
        quantity: 3
    }
]

const RequestCommodties = ({ requestCommodties }: {
    requestCommodties: Array<{
        commodity: ICommodity
        quantity: number
    }>
}) => {
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [commoditiesTableData, setCommoditiesTableData] = useState<Array<ICommodityTableData>>([]);
    const [loading, setLoading] = useState(true);

    const {
        commodity,
        ...data
    } = defaultCommodities[0];

    const rowData = {
        name: defaultCommodities[0].commodity.name,
        unitOfMeasure: defaultCommodities[0].commodity.groupName,
        assetType: defaultCommodities[0].commodity.assetType?.name,
        ...data,
    };

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData));
        setLoading(false);
    }, []);

    const handleCommoditiesTableData = (commodities: Array<{
        commodity: ICommodity
        quantity: number
    }>) => {
        if (!commodities || commodities.length === 0) {
            setCommoditiesTableData([]);
            return;
        }

        const data: Array<ICommodityTableData> = commodities.map((com, index) => {
            return {
                id: index,
                name: com.commodity.name,
                unitOfMeasure: com.commodity.groupName,
                assetType: com.commodity.assetType?.name as string,
                quantity: com.quantity
            };
        });

        setCommoditiesTableData(data);
    }

    useEffect(() => { 
        handleCommoditiesTableData(requestCommodties);
    }, [requestCommodties]);

    if (loading) {
        return (
            <Box sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Loading commodities...
                </Typography>
            </Box>
        );
    }

    if (!requestCommodties || requestCommodties.length === 0) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px dashed ${alpha('#000', 0.15)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    bgcolor: alpha('#f5f5f5', 0.5),
                    my: 2
                }}
            >
                <InventoryIcon sx={{ color: 'text.disabled' }} />
                <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No items requested
                </Typography>
            </Paper>
        );
    }

    return columnHeaders.length === 0 ? null : (
        <Box sx={{ mt: 1 }}>
            <TableComponent
                endPoint=""
                loading={false}
                count={requestCommodties.length}
                exportData
                header={{ plural: 'Requested Items', singular: 'Item' }}
                module="RequestCommodities"
                rows={commoditiesTableData}
                createAction={false}
                columnHeaders={columnHeaders}
                searchAction={false}
                paginationMode='client'
                refresh={false}
            />
        </Box>
    );
}

export default RequestCommodties;
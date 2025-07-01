/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid } from "@mui/material";
import ViewInventoryutills from "./utills";
import TableComponent from "../../../components/tables/TableComponent";
import { useEffect } from "react";
import { IInventory, IStockCommodities } from "../interface";

const OtherDetails = ({ inventory }: { inventory: IInventory }) => {
    const {
        columnHeaders,
        endPoint,
        loading,
        header,
        stocksTableData,
        handleInventoryTableData
    } = ViewInventoryutills()

    useEffect(() => {
        if (inventory.id
            && (inventory.commodities as Array<IStockCommodities>).length > 0) {
            handleInventoryTableData(inventory.commodities as Array<IStockCommodities>)
        }
    }, [inventory])

    return (
        <>
            <Grid xs={12} container>
                {columnHeaders.length > 0 &&
                    <TableComponent
                        endPoint={endPoint}
                        loading={loading}
                        count={100}
                        exportData
                        header={header}
                        module="assignment history"
                        rows={stocksTableData || []}
                        columnHeaders={columnHeaders}
                        paginationMode='server'
                    />
                }
            </Grid>
        </>
    )
};

export default OtherDetails;
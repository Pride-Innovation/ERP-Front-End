import { useEffect } from "react"
import { IGRNReport } from "../interface"
import GrnReportUtills from "./grnReportUtills"
import { Grid } from "@mui/material";
import TableComponent from "../../../components/tables/TableComponent";

const InventoryGRN = ({ grnList }: { grnList: IGRNReport[] }) => {
    const {
        columnHeaders,
        endPoint,
        header,
        stocksTableData,
        handleInventoryTableData,
        handleOptionClicked
    } = GrnReportUtills();

    useEffect(() => {
        handleInventoryTableData(grnList as Array<IGRNReport>)
    }, [grnList])

    return (
        <>
            <Grid xs={12} container>
                {columnHeaders.length > 0 &&
                    <TableComponent
                        endPoint={endPoint}
                        loading={false}
                        count={100}
                        exportData
                        header={header}
                        module="assignment history"
                        rows={stocksTableData || []}
                        columnHeaders={columnHeaders}
                        paginationMode='server'
                        handleOptionClicked={handleOptionClicked}
                    />
                }
            </Grid>
        </>
    )
}

export default InventoryGRN
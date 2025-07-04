import { useEffect } from "react"
import { IGRNReport } from "../interface"
import GrnReportUtills from "./grnReportUtills"
import { Grid } from "@mui/material";
import TableComponent from "../../../components/tables/TableComponent";
import { crudStates } from "../../../utils/constants";
import ModalComponent from "../../../components/modal";
import UploadGRN from "../UploadGRN";

const InventoryGRN = ({ grnList }: { grnList: IGRNReport[] }) => {
    const {
        columnHeaders,
        endPoint,
        header,
        stocksTableData,
        handleInventoryTableData,
        handleOptionClicked,
        modalState,
        open,
        currentGRN,
        handleClose
    } = GrnReportUtills();

    useEffect(() => {
        handleInventoryTableData(grnList as Array<IGRNReport>)
    }, [grnList])

    return (
        <>
            {modalState === crudStates.upload &&
                <ModalComponent title='Upload Signed GRN' open={open} handleClose={handleClose} width="40%">
                    <UploadGRN id={currentGRN?.id} />
                </ModalComponent>
            }
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
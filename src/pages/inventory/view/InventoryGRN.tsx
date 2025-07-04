import { useEffect, useState } from "react"
import { IGRNReport } from "../interface"
import GrnReportUtills from "./grnReportUtills"
import { Box, Grid } from "@mui/material";
import TableComponent from "../../../components/tables/TableComponent";
import { crudStates } from "../../../utils/constants";
import ModalComponent from "../../../components/modal";
import UploadGRN from "../UploadGRN";
import ButtonComponent from "../../../components/forms/Button";

const InventoryGRN = ({ grnList }: { grnList: IGRNReport[] }) => {
    const [fileURL, setFileURL] = useState<string>("");

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
    }, [grnList]);

    useEffect(() => {
        if ((currentGRN?.documentPath as string)?.length > 0) {
            const filename = currentGRN?.documentPath.split('/').pop();
            const publicPath = `/statics/${filename}`;
            setFileURL(publicPath);
        } else {
            setFileURL("");
        }
    }, [currentGRN])

    return (
        <>
            {modalState === crudStates.upload &&
                <ModalComponent title='Upload Signed GRN' open={open} handleClose={handleClose} width="40%">
                    <UploadGRN id={currentGRN?.id} />
                </ModalComponent>
            }
            {modalState === crudStates.read && <ModalComponent title='View Signed Inventory'
                open={open}
                handleClose={handleClose}
                width="80%">
                <iframe
                    src={fileURL}
                    title="PDF Preview"
                    width="100%"
                    style={{ border: 'none', minHeight: '500px', overflow: 'hidden' }}
                />
                <Box sx={{ width: "100px", ml: "auto", mt: 2 }}>
                    <ButtonComponent
                        sendingRequest={false}
                        buttonText="Close"
                        variant="contained"
                        buttonColor="secondary"
                        handleClick={handleClose} />
                </Box>
            </ModalComponent>}
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
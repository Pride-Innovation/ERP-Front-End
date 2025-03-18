import { useContext, useEffect, useState } from "react";
import RowContext from "../../../context/row/RowContext";
import { fetchRowsService } from "../../../core/apis/globalService";
import { GridRowsProp } from "@mui/x-data-grid";
import { repairHistoryMock } from "../../../mocks/repairHistory";
import { crudStates } from "../../../utils/constants";
import { Grid } from "@mui/material";
import ModalComponent from "../../../components/modal";
import TableComponent from "../../../components/tables/TableComponent";
import RepairHistoryUtills from "./RepairHistoryUtills";
import { ErrorMessage } from "../../../core/apis/axiosInstance";

const RepairHistory = ({ id }: { id: string | number }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const { setRows, rows } = useContext(RowContext);
    const { endPoint, columnHeaders, header, modalState, open, handleClose, handleCreation } = RepairHistoryUtills()

    const fetchResources = async () => {
        setLoading(true)
        try {
            const response = await fetchRowsService({ pageNumber: 1, pageSize: 10, endPoint }) as unknown as GridRowsProp;
            console.log(response, "response!!")
            setRows([...repairHistoryMock]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ErrorMessage;
            console.log(errorMessage)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchResources();
    }, []);

    return (
        <>
            {rows?.length > 0 && <Grid xs={12} container>
                {modalState === crudStates.create &&
                    <ModalComponent title='Create Repair History' open={open} handleClose={handleClose} width="60%">
                        <p>Modal Information!!</p>
                    </ModalComponent>
                }
                {columnHeaders.length > 0 &&
                    <TableComponent
                        endPoint={endPoint}
                        loading={loading}
                        count={100}
                        exportData
                        createAction
                        header={header}
                        rows={rows}
                        columnHeaders={columnHeaders}
                        paginationMode='client'
                        onCreationHandler={handleCreation}
                    />
                }
            </Grid>}
        </>
    )
}

export default RepairHistory
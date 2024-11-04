import { useContext, useEffect, useState } from "react"
import { Grid } from "@mui/material"
import TableComponent from "../../../components/tables/TableComponent"
import assignmentHistoryMock from "../../../mocks/assignmentHistory"
import { fetchRowsService } from "../../../core/apis/globalService"
import { GridRowsProp } from "@mui/x-data-grid"
import RowContext from "../../../context/row/RowContext"
import AssignmentHistoryUtills from "./AssignmentHistoryUtills"
import { crudStates } from "../../../utils/constants"
import ModalComponent from "../../../components/modal"
import { ErrorMessage } from "../../../core/apis/axiosInstance"

const AssignmentHistory = ({ id }: { id: string | number }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const { setRows, rows } = useContext(RowContext);
    const { endPoint, columnHeaders, header, modalState, open, handleClose, handleCreation } = AssignmentHistoryUtills()

    const fetchResources = async () => {
        setLoading(true)
        try {
            const response = await fetchRowsService({ page: 1, size: 10, endPoint }) as unknown as GridRowsProp;
            console.log(response, "response!!")
            setRows([...assignmentHistoryMock]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ErrorMessage;
            console.log(errorMessage)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchResources();
    }, [id]);

    return (
        <>
            {rows?.length > 0 && <Grid xs={12} container>
                {modalState === crudStates.create &&
                    <ModalComponent title='Create User' open={open} handleClose={handleClose} width="60%">
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
                        module=""
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

export default AssignmentHistory
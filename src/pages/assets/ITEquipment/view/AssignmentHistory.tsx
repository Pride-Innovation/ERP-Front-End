import { useContext, useEffect, useState } from "react"
import { Grid } from "@mui/material"
import TableComponent from "../../../../components/tables/TableComponent"
import assignmentHistoryMock from "../../../../mocks/assignmentHistory"
import { fetchRowsService } from "../../../../core/apis/globalService"
import { GridRowsProp } from "@mui/x-data-grid"
import RowContext from "../../../../context/row/RowContext"
import ITEquipmentViewUtills from "./utills"

const AssignmentHistory = ({ id }: { id: string | number }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const { setRows, rows } = useContext(RowContext);
    const { endPoint, columnHeaders, header } = ITEquipmentViewUtills()

    const fetchResources = async () => {
        setLoading(true)
        try {
            const response = await fetchRowsService({ page: 1, size: 10, endPoint }) as unknown as GridRowsProp;
            console.log(response, "response!!")
            setRows([...assignmentHistoryMock]);
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchResources();
    }, [id]);

    return (
        <>
            {rows?.length > 0 && <Grid xs={12} container>
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
                    />
                }
            </Grid>}
        </>
    )
}

export default AssignmentHistory
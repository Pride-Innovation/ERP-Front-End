import TableComponent from "../../components/tables/TableComponent";
import DashBoardUtills from "./utills";
import { useContext, useEffect, useState } from "react";
import { fetchRowsService } from "../../core/apis/globalService";
import { GridRowsProp } from "@mui/x-data-grid";
import { requestMock } from "../../mocks/request";
import RowContext from "../../context/row/RowContext";
import { RequestContext } from "../../context/request/RequestContext";
import { ErrorMessage } from "../../core/apis/axiosInstance";

const DashboardRequests = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const { endPoint, columnHeaders, header, handleRequest } = DashBoardUtills();
    const { setRows, rows } = useContext(RowContext);
    const { requestTableData } = useContext(RequestContext);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const response = await fetchRowsService({ pageNumber: 1, pageSize: 10, endPoint }) as unknown as GridRowsProp;
            setRows([...response]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ErrorMessage;
            console.log(errorMessage)
        }
        setLoading(false)
    }

    useEffect(() => { fetchResources() }, []);
    useEffect(() => { if (rows.length > 0) { handleRequest(requestMock) } }, [rows])

    return (
        <TableComponent
            endPoint={endPoint}
            loading={loading}
            count={100}
            header={header}
            rows={requestTableData}
            columnHeaders={columnHeaders}
            paginationMode='client'
        />
    )
}

export default DashboardRequests;
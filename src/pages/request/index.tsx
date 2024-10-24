import { useContext, useEffect, useState } from "react";
import { GridRowsProp } from "@mui/x-data-grid";
import RequestUtills from "./utills";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router";
import RowContext from "../../context/row/RowContext";
import { fetchRowsService } from "../../core/apis/globalService";
import { requestMock } from "../../mocks/request";
import { crudStates } from "../../utils/constants";
import { ROUTES } from "../../core/routes/routes";
import TableComponent from "../../components/tables/TableComponent";
import { RequestContext } from "../../context/request/RequestContext";

const Request = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { setRows, rows } = useContext(RowContext);
  const { columnHeaders, endPoint, header, handleRequest } = RequestUtills();
  const navigate = useNavigate();
  const { requestTableData } = useContext(RequestContext);

  const fetchResources = async () => {
    setLoading(true)
    try {
      const response = await fetchRowsService({ page: 1, size: 10, endPoint }) as unknown as GridRowsProp;

      console.log(response, "response!!")
      setRows([...requestMock]);
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  useEffect(() => { fetchResources() }, []);
  useEffect(() => { if (rows.length > 0) { handleRequest(requestMock) } }, [rows])


  const handleOptionClicked = (option: string | number, moduleID?: string | number) => {
    switch (option) {
      case crudStates.update:
        navigate(`${ROUTES.UPDATE_REQUEST}/${moduleID}`);
        break;
      default:
        break;
    }
  }

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
            importData
            header={header}
            rows={requestTableData}
            columnHeaders={columnHeaders}
            onCreationHandler={() => navigate(ROUTES.CREATE_REQUEST)}
            handleOptionClicked={handleOptionClicked}
            paginationMode='client'
          />
        }
      </Grid>}
    </>
  )
}

export default Request
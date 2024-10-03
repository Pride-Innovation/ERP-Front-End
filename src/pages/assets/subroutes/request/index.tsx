import { useContext, useEffect, useState } from "react";
import RowContext from "../../../../context/row/RowContext";
import { fetchRowsService } from "../../../../core/apis/globalService";
import { GridRowsProp } from "@mui/x-data-grid";
import { requestMock } from "../../../../mocks/request";
import RequestUtills from "./utills";
import TableComponent from "../../../../components/tables/TableComponent";
import { Grid } from "@mui/material";

const Request = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { setRows, rows } = useContext(RowContext);
  const { columnHeaders, endPoint, header } = RequestUtills();

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

  useEffect(() => {
    fetchResources()
  }, []);
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
            rows={rows}
            columnHeaders={columnHeaders}
          // onCreationHandler={() => navigate(ROUTES.CREATE_ASSET)}
          // handleOptionClicked={handleOptionClicked}
          />
        }
      </Grid>}
    </>
  )
}

export default Request
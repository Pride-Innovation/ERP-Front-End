import { useContext, useEffect, useState } from "react";
import RowContext from "../../../../context/row/RowContext";
import { fetchRowsService } from "../../../../core/apis/globalService";
import { GridRowsProp } from "@mui/x-data-grid";
import { requestMock } from "../../../../mocks/request";
import RequestUtills from "./utills";
import TableComponent from "../../../../components/tables/TableComponent";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router";
import { ROUTES } from "../../../../core/routes/routes";
import { crudStates } from "../../../../utils/constants";

const Request = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { setRows, rows } = useContext(RowContext);
  const { columnHeaders, endPoint, header } = RequestUtills();
  const navigate = useNavigate();

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


  const handleOptionClicked = (option: string | number, moduleID?: string | number) => {
    console.log(option, moduleID)
    if (option === crudStates.update) {
      navigate(`${ROUTES.UPDATE_REQUEST}/${moduleID}`)
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
            rows={rows}
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
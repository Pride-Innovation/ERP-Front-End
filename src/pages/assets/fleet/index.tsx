import { Grid } from "@mui/material"
import React, { useContext, useEffect, useState } from "react"
import TableComponent from "../../../components/tables/TableComponent"
import { useNavigate } from "react-router";
import FleetUtills from "./utills";
import RowContext from "../../../context/row/RowContext";
import { fetchRowsService } from "../../../core/apis/globalService";
import { GridRowsProp } from "@mui/x-data-grid";
import { fleetsMock } from "../../../mocks/fleet";
import { ROUTES } from "../../../core/routes/routes";
import { crudStates } from "../../../utils/constants";

const Fleet = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { columnHeaders, header, endPoint, handleOpen } = FleetUtills();
    const { setRows, rows } = useContext(RowContext);

    const fetchResources = async () => {
        setLoading(true)
        try {
            const response = await fetchRowsService(
                {
                    page: 1,
                    size: 10,
                    endPoint
                }
            ) as unknown as GridRowsProp;

            console.log(response, "response!!");
            setRows([...fleetsMock]);

        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    useEffect(() => { fetchResources() }, []);

    const handleOptionClicked = (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.update:
                navigate(`${ROUTES.UPDATE_FLEET}/${moduleID}`)
                break;
            case crudStates.dispose:
                handleOpen();
                break;
            case crudStates.read:
                navigate(`${ROUTES.LIST_FLEET}/${moduleID}`)
                break;
            default:
                break;
        }
    }

    return (
        <React.Fragment>
            {rows?.length > 0 &&
                <Grid xs={12} container>
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
                            onCreationHandler={() => navigate(ROUTES.CREATE_FLEET)}
                            handleOptionClicked={handleOptionClicked}
                            paginationMode='client'
                        />
                    }
                </Grid>}
        </React.Fragment>
    )
}

export default Fleet
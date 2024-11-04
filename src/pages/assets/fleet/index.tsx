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
import { IFleet } from "./interface";
import ModalComponent from "../../../components/modal";
import Dispose from "../Dispose";
import { ErrorMessage } from "../../../core/apis/axiosInstance";

const Fleet = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentAsset, setCurrentAsset] = useState<IFleet>({} as IFleet);
    const navigate = useNavigate();
    const { columnHeaders, header, endPoint, handleOpen, determineCurrentAsset, open, handleClose, module } = FleetUtills();
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
            const errorMessage = error instanceof Error ? error.message : ErrorMessage;
            console.log(errorMessage)
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
                setCurrentAsset(determineCurrentAsset(moduleID as number, rows as IFleet[]))
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
            {
                <ModalComponent width={"40%"} title='Dispose Fleet' open={open} handleClose={handleClose}>
                    <Dispose
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                    />
                </ModalComponent>
            }
            {rows?.length > 0 &&
                <Grid xs={12} container>
                    {columnHeaders.length > 0 &&
                        <TableComponent
                            endPoint={endPoint}
                            loading={loading}
                            count={100}
                            exportData
                            createAction
                            module={module}
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
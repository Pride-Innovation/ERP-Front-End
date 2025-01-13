import { Grid } from "@mui/material"
import ModalComponent from "../../../components/modal"
import Dispose from "../Dispose"
import TableComponent from "../../../components/tables/TableComponent"
import ITEquipmentUtills from "./utills"
import { useNavigate } from "react-router"
import { useContext, useEffect, useState } from "react"
import RowContext from "../../../context/row/RowContext"
import { crudStates } from "../../../utils/constants"
import { ROUTES } from "../../../core/routes/routes"
import { IITEquipment } from "./interface"
import { ErrorMessage } from "../../../core/apis/axiosInstance"
import { deleteITEquipmentService, fetchITEquipmentService } from "./service"

const ITEquipment = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentAsset, setCurrentAsset] = useState<IITEquipment>({} as IITEquipment);
    const navigate = useNavigate();
    const { setRows, rows } = useContext(RowContext);

    const {
        open,
        handleClose,
        handleOpen,
        endPoint,
        header,
        columnHeaders,
        module,
        determineCurrentAsset
    } = ITEquipmentUtills();

    const fetchResources = async () => {
        setLoading(true)
        try {
            const response = await fetchITEquipmentService();
            setRows([...response]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ErrorMessage;
            console.log(errorMessage)
        }
        setLoading(false)
    }

    useEffect(() => { fetchResources() }, []);

    const handleOptionClicked = async (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.update:
                navigate(`${ROUTES.UPDATE_ITEQUIPMENT}/${moduleID}`);
                break;
            case crudStates.dispose:
                setCurrentAsset(determineCurrentAsset(moduleID as number, rows as IITEquipment[]))
                handleOpen();
                break;
            case crudStates.read:
                navigate(`${ROUTES.LIST_ASSETS}/${moduleID}`);
                break;
            case crudStates.delete:
                const response = await deleteITEquipmentService(moduleID as number);
                console.log(response, "response information")
                break;
            default:
                break;
        }
    }

    return (
        <>
            {
                <ModalComponent width={"40%"} title='Dispose IT Equipment' open={open} handleClose={handleClose}>
                    <Dispose
                        handleClickAction={handleOptionClicked}
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
                            importData
                            header={header}
                            module={module}
                            rows={rows}
                            columnHeaders={columnHeaders}
                            onCreationHandler={() => navigate(ROUTES.CREATE_ITEQUIPMENT)}
                            handleOptionClicked={handleOptionClicked}
                        />
                    }
                </Grid>}
        </>
    )
}

export default ITEquipment;
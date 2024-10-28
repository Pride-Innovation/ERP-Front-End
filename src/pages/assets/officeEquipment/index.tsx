import React, {
    useContext,
    useEffect,
    useState
} from "react";
import { useNavigate } from "react-router";
import RowContext from "../../../context/row/RowContext";
import { fetchRowsService } from "../../../core/apis/globalService";
import { GridRowsProp } from "@mui/x-data-grid";
import { crudStates } from "../../../utils/constants";
import { Grid } from "@mui/material";
import { officeEquipmentMock } from "../../../mocks/officeEquipment";
import OfficeEquipmentUtills from "./utills";
import TableComponent from "../../../components/tables/TableComponent";
import { ROUTES } from "../../../core/routes/routes";
import { IOfficeEquipment } from "./interface";
import ModalComponent from "../../../components/modal";
import Dispose from "../Dispose";

const OfficeEquipment = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentAsset, setCurrentAsset] = useState<IOfficeEquipment>({} as IOfficeEquipment);
    const navigate = useNavigate();
    const { columnHeaders, header, endPoint, handleOpen, determineCurrentAsset, handleClose, open, module } = OfficeEquipmentUtills();
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
            setRows([...officeEquipmentMock]);

        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    useEffect(() => { fetchResources() }, []);

    const handleOptionClicked = (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.update:
                navigate(`${ROUTES.UPDATE_OFFICE_EQUIPMENT}/${moduleID}`)
                break;
            case crudStates.dispose:
                setCurrentAsset(determineCurrentAsset(moduleID as number, rows as IOfficeEquipment[]))
                handleOpen()
                break;
            case crudStates.read:
                navigate(`${ROUTES.LIST_OFFICE_EQUIPMENT}/${moduleID}`);
                break;
            default:
                break;
        }
    }

    return (
        <React.Fragment>
            {
                <ModalComponent width={"40%"} title='Dispose Office Equipment' open={open} handleClose={handleClose}>
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
                            importData
                            header={header}
                            module={module}
                            rows={rows}
                            columnHeaders={columnHeaders}
                            onCreationHandler={() => navigate(ROUTES.CREATE_OFFICE_EQUIPMENT)}
                            handleOptionClicked={handleOptionClicked}
                            paginationMode='client'
                        />
                    }
                </Grid>}
        </React.Fragment>
    )
}

export default OfficeEquipment;
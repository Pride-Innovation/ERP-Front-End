/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React, {
    useContext,
    useEffect,
    useState
} from "react";
import { useNavigate } from "react-router";
import RowContext from "../../../context/row/RowContext";
import { crudStates } from "../../../utils/constants";
import { Grid } from "@mui/material";
import OfficeEquipmentUtills from "./utills";
import TableComponent from "../../../components/tables/TableComponent";
import { ROUTES } from "../../../core/routes/routes";
import { IOfficeEquipment } from "./interface";
import ModalComponent from "../../../components/modal";
import Dispose from "../Dispose";
import { ErrorMessage } from "../../../core/apis/axiosInstance";
import { deleteOfficeEquipmentService, fetchOfficeEquipmentService } from "./service";

const OfficeEquipment = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentAsset, setCurrentAsset] = useState<IOfficeEquipment>({} as IOfficeEquipment);
    const navigate = useNavigate();
    const { columnHeaders, header, endPoint, handleOpen, determineCurrentAsset, handleClose, open, module } = OfficeEquipmentUtills();
    const { setRows, rows } = useContext(RowContext);

    const fetchResources = async () => {
        setLoading(true)
        try {
            const response = await fetchOfficeEquipmentService();
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
                navigate(`${ROUTES.UPDATE_OFFICE_EQUIPMENT}/${moduleID}`)
                break;
            case crudStates.dispose:
                setCurrentAsset(determineCurrentAsset(moduleID as number, rows as IOfficeEquipment[]))
                handleOpen()
                break;
            case crudStates.read:
                navigate(`${ROUTES.LIST_OFFICE_EQUIPMENT}/${moduleID}`);
                break;
            case crudStates.delete:
                const response = await deleteOfficeEquipmentService(moduleID as number);
                console.log(response, "Item deleted successfully!!")
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
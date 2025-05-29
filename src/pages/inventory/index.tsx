/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { Card, Grid } from "@mui/material"
import TableComponent from "../../components/tables/TableComponent";
import InventoryUtills from "./Utills";
import { crudStates } from "../../utils/constants";
import ModalComponent from "../../components/modal";
import DeleteInventory from "./DeleteInventory";

const Inventory = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const {
        columnHeaders,
        stocksTableData,
        header,
        modalState,
        handleClose,
        handleOptionClicked,
        open,
        handleCreation
    } = InventoryUtills()

    const fetchInventory = async () => { }
    useEffect(() => { fetchInventory() }, []);

    return (
        <Grid xs={12} container>
            {modalState === crudStates.deactivate &&
                <ModalComponent title='Deactivate Inventory' open={open} handleClose={handleClose} width="40%">
                    <DeleteInventory
                        setSendingRequest={setSendingRequest}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        sendingRequest={sendingRequest} />
                </ModalComponent>
            }
            {columnHeaders.length > 0 &&
                <Card sx={{ width: "100%" }}>
                    <TableComponent
                        createAction
                        importData
                        exportData
                        handleOptionClicked={handleOptionClicked}
                        onCreationHandler={handleCreation}
                        module='user'
                        header={header}
                        searchAction
                        rows={stocksTableData}
                        columnHeaders={columnHeaders}
                    />
                </Card>
            }

        </Grid>
    )
}

export default Inventory
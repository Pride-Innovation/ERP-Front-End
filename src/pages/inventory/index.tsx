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
import UploadGRN from "./UploadGRN";
import Container from "./Container";

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
        handleCreation,
        fetchInventory,
        loading,
        count,
        endPoint
    } = InventoryUtills()

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
            {modalState === crudStates.upload &&
                <ModalComponent title='Upload Signed GRN' open={open} handleClose={handleClose} width="40%">
                    <UploadGRN />
                </ModalComponent>
            }
            {columnHeaders.length > 0 &&
                <Container>
                    <TableComponent
                        createAction
                        loading={loading}
                        importData
                        exportData
                        handleOptionClicked={handleOptionClicked}
                        onCreationHandler={handleCreation}
                        module='user'
                        header={header}
                        // searchAction
                        count={count}
                        rows={stocksTableData}
                        columnHeaders={columnHeaders}
                        paginationMode="server"
                        endPoint={endPoint}
                    />
                </Container>
            }

        </Grid>
    )
}

export default Inventory
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
import { inventoryMock } from "../../mocks/inventory";
import CreateInventory from "./CreateInventory";
import UpdateInventory from "./UpdateInventory";
import DeleteInventory from "./DeleteInventory";
import { useNavigate } from "react-router";
import { ROUTES } from "../../core/routes/routes";

const Inventory = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const navigate = useNavigate()
    const {
        columnHeaders,
        setModalState,
        handleOpen,
        inventoryList,
        header,
        modalState,
        handleClose,
        open,
        loadAllInventoryInStore,
        handleCreation,
        findCurrentInventory
    } = InventoryUtills()

    const fetchInventory = async () => {
        try {
            // const response = await fetchUsersService() as unknown as Array<IUser>;
            loadAllInventoryInStore(inventoryMock)
        } catch (error) {
            console.log(error, "response Error")
        }
    }

    useEffect(() => { fetchInventory() }, []);

    const handleOptionClicked = async (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.deactivate:
                findCurrentInventory(moduleID as number)
                setModalState(option as string)
                handleOpen();
                break;
            case crudStates.update:
                findCurrentInventory(moduleID as number)
                setModalState(option as string)
                handleOpen();
                break;
            case crudStates.read:
                navigate(`${ROUTES.INVENTORY}/${moduleID}`)
                break;
            default:
                break
        }
    }

    return (
        <Grid xs={12} container>
            {modalState === crudStates.create &&
                <ModalComponent title='Create Inventory' open={open} handleClose={handleClose} width="70%">
                    <CreateInventory handleClose={handleClose} />
                </ModalComponent>
            }
            {modalState === crudStates.update &&
                <ModalComponent title='Update Inventory' open={open} handleClose={handleClose} width="70%">
                    <UpdateInventory handleClose={handleClose} />
                </ModalComponent>
            }
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
                        rows={inventoryList}
                        columnHeaders={columnHeaders}
                    />
                </Card>
            }

        </Grid>
    )
}

export default Inventory
import { useEffect } from "react";
import { Grid } from "@mui/material"
import TableComponent from "../../components/tables/TableComponent";
import InventoryUtills from "./Utills";
import { crudStates } from "../../utils/constants";
import ModalComponent from "../../components/modal";
import { inventoryMock } from "../../mocks/inventory";
import CreateInventory from "./CreateInventory";

const Inventory = () => {
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
        handleCreation
    } = InventoryUtills()

    const fetchInventory = async () => {
        try {
            // const response = await fetchUsersService() as unknown as Array<IUser>;
            // setUsers(response)
            loadAllInventoryInStore(inventoryMock)
        } catch (error) {
            console.log(error, "response Error")
        }
    }

    useEffect(() => { fetchInventory() }, []);

    const handleOptionClicked = async (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.deactivate:

                setModalState(option as string)
                handleOpen();
                break;
            case crudStates.update:
                setModalState(option as string)
                handleOpen();
                break;
            case crudStates.read:
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
                <ModalComponent title='Update Inventory' open={open} handleClose={handleClose} width="60%">
                    {/* <UpdateUsers handleClose={handleClose} /> */}
                    <p>Update Inventory</p>
                </ModalComponent>
            }
            {modalState === crudStates.deactivate &&
                <ModalComponent title='Deactivate User' open={open} handleClose={handleClose} width="40%">
                    {/* <Deactivate handleDeactivate={deactivateUser} user={user} handleClose={handleClose} buttonText='Deactivate' sendingRequest={false} /> */}
                    <p>Update Inventory</p>
                </ModalComponent>
            }
            {columnHeaders.length > 0 &&
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
                />}
        </Grid>
    )
}

export default Inventory
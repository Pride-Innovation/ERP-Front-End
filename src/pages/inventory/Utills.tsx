import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { ITableHeader } from "../../components/tables/interface";
import { useSelector } from "react-redux";
import { inventoryMock } from "../../mocks/inventory";
import { crudStates } from "../../utils/constants";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { getTableHeaders } from "../../components/tables/getTableHeaders";
import { loadAllInventory } from "./slice";
import { IInventory } from "./interface";


const InventoryUtills = () => {
    const header = { plural: 'Inventory', singular: 'Inventory' }
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    const { inventoryList } = useSelector((state: RootState) => state.InventoryStore);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const loadAllInventoryInStore = (inventory: IInventory[]) => {
        dispatch(loadAllInventory(inventory))
    }

    const {
        id,
        description,
        expirationDate,
        ...data
    } = inventoryMock[0];

    const rowData = {
        ...data,
        action: {
            label: "options",
            options: [
                { value: crudStates.deactivate, label: "Deactivate", icon: <InfoIcon fontSize='small' color='error' /> },
                { value: crudStates.update, label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
                { value: crudStates.read, label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' color='inherit' /> }
            ]
        },
    };

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);

    return ({
        columnHeaders,
        setModalState,
        handleClose,
        handleOpen,
        modalState,
        open,
        setOpen,
        inventoryList,
        header,
        loadAllInventoryInStore
    })
}

export default InventoryUtills
import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { IOptions, ITableHeader } from "../../components/tables/interface";
import { useSelector } from "react-redux";
import { inventoryMock } from "../../mocks/inventory";
import { crudStates } from "../../utils/constants";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { getTableHeaders } from "../../components/tables/getTableHeaders";
import { loadAllInventory } from "./slice";
import { IInventory } from "./interface";
import { IFormData } from "../assets/interface";
import { loadUnitOfMeasures } from "../settings/unitMeasure/slice";
import { listUnitOfMeasuresService } from "../assets/ITEquipment/service";
import { loadSuppliers } from "../settings/suppliers/slice";
import { listSuppliersService } from "../settings/suppliers/service";
import { InventoryContext } from "../../context/inventory";


const InventoryUtills = () => {
    const header = { plural: 'Inventory', singular: 'Inventory' }
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    const { setCurrentInventory } = useContext(InventoryContext);
    const { unitsOfMeasure } = useSelector((state: RootState) => state.UnitsOfMeasureStore);
    const { inventoryList } = useSelector((state: RootState) => state.InventoryStore);
    const { suppliers } = useSelector((state: RootState) => state.SuppliersStore);
    const [optionsObject, setOptionsObject] = useState<{
        unitsOfMeasuresOptions: Array<IOptions>;
        suppliersOptions: Array<IOptions>
    }>({
        unitsOfMeasuresOptions: [],
        suppliersOptions: []
    });

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const loadAllInventoryInStore = (inventory: IInventory[]) => {
        dispatch(loadAllInventory(inventory))
    }

    const updateReduxStore = async () => {
        dispatch(loadUnitOfMeasures(await listUnitOfMeasuresService()));
        dispatch(loadSuppliers(await listSuppliersService()));

    }

    useEffect(() => { updateReduxStore() }, []);

    const findCurrentInventory = (id: string | number) => {
        setCurrentInventory(() => {
            return inventoryList.find(inventory => inventory?.id === id) as IInventory
        })
    }

    useEffect(() => {
        setOptionsObject({
            unitsOfMeasuresOptions: unitsOfMeasure?.map(unit => ({ label: unit.name, value: unit?.id as number })) || [],
            suppliersOptions: suppliers?.map(supplier => ({ label: supplier.name, value: supplier?.id as number })) || [],
        })

    }, [unitsOfMeasure, suppliers])

    const handleCreation = () => {
        setModalState(crudStates.create);
        handleOpen();
    };

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

    const formFields: Array<IFormData<IInventory>> = [
        {
            value: "name",
            label: 'Name',
            type: "input"
        },
        {
            value: "quantityInStock",
            label: 'Quantity In Stock',
            type: "number"
        },
        {
            value: "unitOfMeasure",
            label: 'Unit',
            type: "select",
            options: optionsObject.unitsOfMeasuresOptions
        },
        {
            value: "location",
            label: 'Location',
            type: "input"
        },
        {
            value: "category",
            label: 'category',
            type: "select",
            options: [
                { label: "Furniture", value: 1 },
                { label: "Office Equipment", value: 2 },
            ]
        },
        {
            value: "reorderLevel",
            label: 'Reorder Level',
            type: "number"
        },
        {
            value: "costPrice",
            label: 'Cost Price',
            type: "number"
        },
        {
            value: "purchasePrice",
            label: 'Purchase Price',
            type: "number",

        },
        {
            value: "supplier",
            label: 'Supplier',
            type: "select",
            options: optionsObject.suppliersOptions

        },
        {
            value: "expirationDate",
            label: 'Expiration Date',
            type: "date"
        },
        {
            value: "description",
            label: 'Description',
            type: "textarea"
        }
    ]

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
        loadAllInventoryInStore,
        handleCreation,
        formFields,
        findCurrentInventory
    })
}

export default InventoryUtills
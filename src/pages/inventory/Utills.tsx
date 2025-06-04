/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "../../store";
import { IOptions, ITableHeader } from "../../components/tables/interface";
import { useSelector } from "react-redux";
import { inventoryMock } from "../../mocks/inventory";
import { crudStates } from "../../utils/constants";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { getTableHeaders } from "../../components/tables/getTableHeaders";
import { IInventoriesAxiosResponse, IInventory, IInventoryTableData } from "./interface";
import { IFormData } from "../assets/interface";
import { useNavigate } from "react-router";
import { ROUTES } from "../../core/routes/routes";
import axiosInstance from "../../core/apis/axiosInstance";
import { useDispatch } from "react-redux";
import { loadAllInventory } from "./slice";


const InventoryUtills = () => {
    const header = { plural: 'Inventory', singular: 'Inventory' }
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const { inventory } = useSelector((state: RootState) => state.InventoryStore);
    const [stocksTableData, setStocksTableData] = useState<Array<IInventoryTableData>>([] as Array<IInventoryTableData>);
    const { suppliers } = useSelector((state: RootState) => state.SuppliersStore)
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const [optionsObject, setOptionsObject] = useState<{
        suppliersOptions: Array<IOptions>
    }>({
        suppliersOptions: []
    });

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const {
        id,
        supplier,
        branch,
        status,
        deliveryNote,
        stockCommodities,
        ...data
    } = inventoryMock[0];

    const rowData = {
        ...data,
        status: inventoryMock[0]?.status?.status,
        supplier: inventoryMock[0]?.supplier?.name,
        branch: inventoryMock[0].branch?.name,
        action: {
            label: "options",
            options: [
                { value: crudStates.deactivate, label: "Deactivate", icon: <InfoIcon fontSize='small' color='error' /> },
                { value: crudStates.update, label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
                { value: crudStates.read, label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' color='inherit' /> }
            ]
        },
    };

    const fetchInventory = async () => {
        try {
            const response = await axiosInstance.get("stocks") as IInventoriesAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllInventory(response.data.content))
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleInventoryTableData = (inventory: Array<IInventory>) => {
        const data: Array<IInventoryTableData> = inventory.map((stock, index) => {
            const {
                branch,
                stockCommodities,
                status,
                supplier,
                deliveryNote,
                ...fielsdata
            } = inventory[index];

            return (
                {
                    ...fielsdata,
                    name: stock.name,
                    referenceNumber: stock.referenceNumber,
                    totalCost: stock.totalCost as number,
                    balanceCost: stock.totalCost as number,
                    branch: stock.branch?.name as string,
                    status: stock.status?.status as string,
                    supplier: stock.supplier?.name as string

                }
            )
        })

        setStocksTableData(data);
    }

    useEffect(() => {
        if (inventory.length > 0) {
            handleInventoryTableData(inventory)
        }
    }, [inventory]);


    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);

    useEffect(() => {
        if (suppliers.length > 0) {
            setOptionsObject(() => ({
                suppliersOptions: suppliers?.map(supplier => ({ label: supplier.name, value: supplier.id as number })) || []
            }))
        }

    }, [suppliers])

    const formFields: Array<IFormData<IInventory>> = [
        {
            value: "name",
            label: 'Name',
            type: "input"
        },
        {
            value: "referenceNumber",
            label: 'Reference Number',
            type: "input"
        },
        {
            value: "supplier",
            label: 'supplier',
            type: "autocomplete",
            options: optionsObject.suppliersOptions
        },
    ]

    const handleCreation = () => navigate(ROUTES.CREATE_INVENTORY)

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

    return ({
        columnHeaders,
        handleClose,
        modalState,
        open,
        header,
        formFields,
        stocksTableData,
        handleOptionClicked,
        handleCreation,
        fetchInventory
    })
}

export default InventoryUtills
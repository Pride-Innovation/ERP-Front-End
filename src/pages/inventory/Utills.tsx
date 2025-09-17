/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from "react";
import { AppDispatch, RootState } from "../../store";
import { IOptions, ITableHeader } from "../../components/tables/interface";
import { useSelector } from "react-redux";
import { inventoryMock } from "../../mocks/inventory";
import { crudStates } from "../../utils/constants";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { getTableHeaders } from "../../components/tables/getTableHeaders";
import {
    IInventoriesAxiosResponse,
    IInventory,
    IInventoryTableData,
    IStockCommodities
} from "./interface";
import { IFormData } from "../assets/interface";
import { useNavigate } from "react-router";
import { ROUTES } from "../../core/routes/routes";
import { useDispatch } from "react-redux";
import { loadAllInventory } from "./slice";
import { fetchRowsService } from "../../core/apis/globalService";
import moment from "moment";
import { generateGoodsReceivedNote } from "../../utils/goodReceivedNotes";
import Logo from "../../statics/images/grnFormLogo.png";
import { InventoryContext } from "../../context/inventory";

const InventoryUtills = () => {
    const endPoint: string = "stocks";
    const header = { plural: 'Inventory', singular: 'Inventory' }
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const { inventory } = useSelector((state: RootState) => state.InventoryStore);
    const [stocksTableData, setStocksTableData] = useState<Array<IInventoryTableData>>([] as Array<IInventoryTableData>);
    const { suppliers } = useSelector((state: RootState) => state.SuppliersStore)
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState<boolean>(false);
    const [count, setCount] = useState<number>(0)
    const { setCurrentInventory, setInventoryCount } = useContext(InventoryContext)

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
        commodities,
        balanceCost,
        totalCost,
        createDate,
        createdBy,
        lastModified,
        lastModifiedBy,
        referenceNumber,
        ...data
    } = inventoryMock[0];

    const rowData = {
        ...data,
        totalItemsOrdered: '',
        totalItemsDelivered: '',
        status: inventoryMock[0]?.status?.status,
        supplier: inventoryMock[0]?.supplier?.name,
        branch: inventoryMock[0].branch?.name,
        date: "",
        action: {
            label: "options",
            options: [
                { value: crudStates.deactivate, label: "Deactivate", icon: <InfoIcon fontSize='small' color='error' /> },
                { value: crudStates.update, label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
                { value: crudStates.read, label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' color='inherit' /> }
            ]
        },
    };

    const fetchInventory = async (params?: Record<string, any>) => {
        setLoading(true)
        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 10,
                endPoint,
                params
            }) as IInventoriesAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllInventory(response.data.content));
                setCount(response.data.totalElements);
                setInventoryCount(response.data.totalElements);
            }
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    const sumTotalOrdered = (commodities: Array<IStockCommodities>): number => {
        return commodities.reduce((acc, val) => (acc + val.orderedQuantity), 0)
    }

    const sumTotalDelivered = (commodities: Array<IStockCommodities>): number => {
        return commodities.reduce((acc, val) => (acc + val.deliveredQuantity), 0)
    }

    const handleInventoryTableData = (inventory: Array<IInventory>) => {
        const data: Array<IInventoryTableData> = inventory.map((stock, index) => {
            const {
                branch,
                commodities,
                status,
                balanceCost,
                totalCost,
                supplier,
                deliveryNote,
                createDate,
                createdBy,
                lastModified,
                lastModifiedBy,
                referenceNumber,
                ...fielsdata
            } = inventory[index];

            return (
                {
                    ...fielsdata,
                    totalItemsOrdered: sumTotalOrdered(stock.commodities as IStockCommodities[]),
                    totalItemsDelivered: sumTotalDelivered(stock.commodities as IStockCommodities[]),
                    branch: stock.branch?.name as string,
                    status: stock.status?.status as string,
                    supplier: stock.supplier?.name as string,
                    date: moment(stock.createDate as string).format("Do MMM YYYY")

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
            value: "lpoNumber",
            label: 'LPO Number',
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

    const findStockById = (id: string | number) => {
        return inventory.find((stock: IInventory) => stock.id === id);
    }

    const handleOptionClicked = async (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.deactivate:
                setModalState(option as string)
                handleOpen();
                break;
            case crudStates.update:
                navigate(`${ROUTES.UPDATE_INVENTORY}/${moduleID}`)
                break;
            case crudStates.read:
                navigate(`${ROUTES.READ_INVENTORY}/${moduleID}`)
                break;
            case crudStates.download:
                const data = findStockById(moduleID as number);
                generateGoodsReceivedNote(data as IInventory, Logo);
                break;
            case crudStates.upload:
                const val = findStockById(moduleID as number) as IInventory;
                setCurrentInventory(val);
                setModalState(option as string);
                handleOpen();
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
        fetchInventory,
        loading,
        count,
        endPoint,
        handleOpen
    })
}

export default InventoryUtills
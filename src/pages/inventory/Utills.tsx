/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from "react";
import { PERMISSIONS } from '../../core/permissions/constants';
import { AppDispatch, RootState } from "../../store";
import { IOptions, ITableHeader } from "../../components/tables/interface";
import { useSelector } from "react-redux";
import { inventoryMock } from "../../mocks/inventory";
import { crudStates } from "../../utils/constants";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
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
import { generateGrnPdf } from "./view/generateGrnPdf";
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
        grnNumber,
        lpoNumber,
        name,
        ...data
    } = inventoryMock[0];

    const rowData = {
        ...data,
        date: "",
        "LPO Number": inventoryMock[0].lpoNumber,
        supplier: inventoryMock[0]?.supplier?.name,
        Supply: "",
        totalItemsOrdered: '',
        totalItemsDelivered: '',
        status: inventoryMock[0]?.status?.status,
        branch: inventoryMock[0].branch?.name,
        action: {
            label: "options",
            options: [
                { value: crudStates.read, label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' />, divider: true },
                // Receiving and correcting are different jobs with different consequences, so they
                // are different menu items. "Update" on its own read as the way to complete a
                // partial delivery, which it never was.
                /*
                  * Endpoints, so this list and the security rules can be read against each other:
                  *   Receive Delivery  PUT    /stocks/**  UPDATE_INVENTORY
                  *   Correct Details   PUT    /stocks/**  UPDATE_INVENTORY
                  *   Delete            DELETE /stocks/**  DELETE_INVENTORY
                  */
                { value: crudStates.receiveDelivery, label: "Receive Delivery", icon: <LocalShippingOutlinedIcon fontSize='small' color='primary' />, permission: PERMISSIONS.UPDATE_INVENTORY },
                { value: crudStates.update, label: "Correct Details", icon: <ModeEditIcon fontSize='small' color='info' />, permission: PERMISSIONS.UPDATE_INVENTORY },
                { value: crudStates.delete, label: "Delete", icon: <InfoIcon fontSize='small' color='error' />, permission: PERMISSIONS.DELETE_INVENTORY }
            ]
        },
    };

    const fetchInventory = async (
        params?: Record<string, any>,
        pageModel?: { page: number; pageSize: number },
    ) => {
        setLoading(true)
        try {
            const response = await fetchRowsService({
                // Paging comes back through here so the page's own derived params — the resolved
                // stocking-status id, the toolbar's date range — survive past page one.
                pageNumber: pageModel?.page ?? 0,
                pageSize: pageModel?.pageSize ?? 10,
                endPoint,
                params
            }) as IInventoriesAxiosResponse;

            if (response.status === 200) {
                dispatch(loadAllInventory(response.data.content));
                setCount(response.data.totalElements);
                setInventoryCount(response.data.totalElements);
            } else {
                /*
                 * The request failed, and the rows on screen must not survive it.
                 *
                 * Services here answer `catch (error) { return error }`, so a 4xx arrives as a value
                 * with no `status` rather than as a throw — the check above simply fails and, before
                 * this branch existed, the function returned having changed nothing. The previous
                 * filter's rows stayed on screen under the new filter's chips, with the record count
                 * still describing them. It looked like a successful match.
                 *
                 * Clearing is the lesser of two imperfect answers: an empty table after a failure is
                 * not strictly accurate either — we do not know that nothing matched — but the axios
                 * interceptor has already raised the error, and stale rows outlive that message
                 * while quietly claiming to be the result.
                 */
                dispatch(loadAllInventory([]));
                setCount(0);
                setInventoryCount(0);
            }
        } catch (error) {
            // A genuine throw, rather than the error-as-value above. Same reasoning: do not leave
            // the previous result standing in for one we never received.
            dispatch(loadAllInventory([]));
            setCount(0);
            setInventoryCount(0);
            console.error('Failed to load inventory', error);
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
                lpoNumber,
                grnNumber,
                name,
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
                    date: moment(stock.createDate as string).format("Do MMM YYYY"),
                    "LPO Number": stock.lpoNumber,
                    "Supply": stock?.name as string,
                }
            )
        })

        setStocksTableData(data);
    }

    /*
     * Rebuilt on every change, including when the result is empty.
     *
     * The guard that used to sit here — `if (inventory?.length > 0)` — meant a filter matching
     * nothing never reached the mapper, so the table kept the previous rows while the record count
     * beside it correctly dropped to zero. The page said "0 records" over a full table, and the rows
     * on screen belonged to the *previous* filter: not an empty state, a wrong one.
     *
     * The assets page carries the same comment for the same reason. An empty list is a result, not
     * an absence of one, and it has to be rendered as such.
     */
    useEffect(() => {
        handleInventoryTableData(inventory ?? []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            value: "poNumber",
            label: 'PO Number',
            type: "input",
            required: false
        },
        {
            value: "supplier",
            label: 'supplier',
            type: "autocomplete",
            options: optionsObject.suppliersOptions
        },
        // Business dates. deliveryDate drives asset depreciation/age. Marked not-required
        // at the RHF level so the shared form (also used by Update) isn't blocked on legacy
        // records; the create flow enforces deliveryDate via its yup schema.
        {
            value: "orderDate",
            label: 'Order Date',
            type: "date",
            required: false
        },
        {
            value: "deliveryDate",
            label: 'Delivery Date',
            type: "date",
            required: false
        },
        {
            value: "invoiceDate",
            label: 'Invoice Date',
            type: "date",
            required: false
        },
    ]

    const handleCreation = () => navigate(ROUTES.CREATE_INVENTORY)

    const findStockById = (id: string | number) => {
        return inventory.find((stock: IInventory) => stock.id === id);
    }

    const handleOptionClicked = async (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.delete:
                const res = findStockById(moduleID as number) as IInventory;
                setCurrentInventory(res);
                setModalState(option as string)
                handleOpen();
                break;
            case crudStates.update:
                navigate(`${ROUTES.UPDATE_INVENTORY}/${moduleID}`)
                break;
            case crudStates.receiveDelivery:
                // The Delivery Status panel on the detail page owns receiving; it knows what is
                // still outstanding per line, which the list row does not.
                navigate(`${ROUTES.READ_INVENTORY}/${moduleID}?action=receive`)
                break;
            case crudStates.read:
                navigate(`${ROUTES.READ_INVENTORY}/${moduleID}`)
                break;
            case crudStates.download:
                // From the list there is no single GRN in context, so this prints the order's
                // cumulative position across every delivery.
                await generateGrnPdf(findStockById(moduleID as number) as IInventory);
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
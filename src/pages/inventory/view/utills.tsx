import { useContext, useEffect, useState } from "react";
import { ITableHeader } from "../../../components/tables/interface";
import { fetchInventoryByIDService } from "../service";
import {
    IInventoryAxiosResponse,
    IInventoryDetailsTableData,
    IStockCommodities
} from "../interface";
import { InventoryContext } from "../../../context/inventory";
import { inventoryMock } from "../../../mocks/inventory";
import { getTableHeaders } from "../../../components/tables/getTableHeaders";

const ViewInventoryutills = () => {
    const endPoint: string = "stocks";
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const { setCurrentInventory } = useContext(InventoryContext);
    const [loading, setLoading] = useState<boolean>(false);
    const header = { plural: 'Inventory', singular: 'Inventory' }
    const [stocksTableData, setStocksTableData] = useState<Array<IInventoryDetailsTableData>>([] as Array<IInventoryDetailsTableData>);

    const {
        commodity,
        ...data
    } = (inventoryMock[0]?.commodities as IStockCommodities[])[0];

    const rowData = {
        name: "",
        ...data,

    };

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);

    const handleInventoryTableData = (inventory: Array<IStockCommodities>) => {
        const data: Array<IInventoryDetailsTableData> = inventory.map((cmd, index) => {
            const {
                commodity,
                ...fielsdata
            } = inventory[index];

            return (
                {
                    ...fielsdata,
                    id: index + 1,
                    name: cmd.commodity.name,
                    orderedQuantity: cmd.orderedQuantity,
                    deliveredQuantity: cmd.deliveredQuantity,
                    costPrice: cmd.costPrice,
                    purchasePrice: cmd.purchasePrice,

                }
            )
        })

        setStocksTableData(data);
    }



    const fetchInventoryByID = async (id: string | number) => {
        setLoading(true)
        try {
            const response = await fetchInventoryByIDService(id as string) as IInventoryAxiosResponse;
            if (response.status === 200) {
                setCurrentInventory(response.data)
            }
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    return ({
        columnHeaders,
        endPoint,
        fetchInventoryByID,
        loading,
        header,
        handleInventoryTableData,
        stocksTableData
    })
}

export default ViewInventoryutills
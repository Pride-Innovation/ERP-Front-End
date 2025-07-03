import { useContext, useEffect, useState } from "react";
import { ITableHeader } from "../../../components/tables/interface";
import { IGRNCommoditiesAxiosResponse, IGRNReport, IGRNReportTableData } from "../interface";
import { grnReportsMock } from "../../../mocks/inventory";
import { getTableHeaders } from "../../../components/tables/getTableHeaders";
import moment from "moment";
import { crudStates } from "../../../utils/constants";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import ArrowCircleDownOutlinedIcon from '@mui/icons-material/ArrowCircleDownOutlined';
import { InventoryContext } from "../../../context/inventory";
import { fetchGrnCommoditiesByStockIDService } from "../service";



const GrnReportUtills = () => {
    const endPoint: string = "grn-reports";
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const { currentInventory } = useContext(InventoryContext);
    const header = { plural: 'GRN Report', singular: 'GRN Report' }
    const [stocksTableData, setStocksTableData] = useState<Array<IGRNReportTableData>>([] as Array<IGRNReportTableData>);

    const {
        createdBy,
        lastModifiedBy,
        createDate,
        lastModified,
        documentPath,
        id,
        name,
        ...data
    } = grnReportsMock[0];

    const rowData = {
        grnNumber: "",
        createDate: "",
        lastModified: "",
        grnUploaded: "",
        ...data,
        action: {
            label: "options",
            options: [
                { value: crudStates.read, label: "View GRN", icon: <VisibilityOutlinedIcon fontSize='small' color='primary' /> },
                { value: crudStates.download, label: "Generate GRN", icon: <ArrowCircleDownOutlinedIcon fontSize='small' color='inherit' /> },
                { value: crudStates.upload, label: "Upload Signed GRN", icon: <EditCalendarOutlinedIcon fontSize='small' color='secondary' /> },
            ]
        },
    };


    const handleInventoryTableData = (inventory: Array<IGRNReport>) => {
        const data: Array<IGRNReportTableData> = inventory.map((cmd, index) => {
            const {
                createdBy,
                lastModifiedBy,
                createDate,
                lastModified,
                documentPath,
                name,
                ...fielsdata
            } = inventory[index];

            return (
                {
                    ...fielsdata,
                    grnNumber: cmd.name,
                    createDate: createDate ? moment(cmd.createDate).format('Do MMMM YYYY') : "",
                    lastModified: lastModified ? moment(cmd.lastModified).format('Do MMMM YYYY') : "",
                    grnUploaded: cmd?.documentPath?.length > 0 ? "Uploaded" : "Not Uploaded",
                }
            )
        })

        setStocksTableData(data);
    }

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);

    const fetchGrnCommoditiesByStockID = async (id: string | number) => {
        try {
            const response = await fetchGrnCommoditiesByStockIDService(id as string) as IGRNCommoditiesAxiosResponse;
            if (response.status === 200) {
                console.log("GRN commodities fetched successfully:", response.data.content);
                console.log(currentInventory, "Current Inventory ID for GRN commodities fetch");
            }
        } catch (error) {
            console.error("Error fetching GRN commodities by stock ID:", error);

        }
    }

    useEffect(() => {
        if (currentInventory?.id) {
            fetchGrnCommoditiesByStockID(currentInventory.id);
        }
    }, [currentInventory?.id]);

    const handleOptionClicked = async (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.download:
                // const data = findStockById(moduleID as number);
                // generateGoodsReceivedNote(data as IInventory, Logo);
                console.log(currentInventory.id, "Download GRN Report clicked");
                console.log(moduleID, "Download GRN Report clicked");

                break;
            case crudStates.upload:
                console.log(moduleID, "Upload GRN Report clicked");
                // const val = findStockById(moduleID as number) as IInventory;
                // setCurrentInventory(val);
                // setModalState(option as string);
                // handleOpen();
                break;
            default:
                break
        }
    }

    return ({
        columnHeaders,
        endPoint,
        header,
        handleInventoryTableData,
        stocksTableData,
        handleOptionClicked
    }
    )
}

export default GrnReportUtills
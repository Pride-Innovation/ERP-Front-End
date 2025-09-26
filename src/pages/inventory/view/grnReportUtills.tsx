import {
    useContext,
    useEffect,
    useState
} from "react";
import { ITableHeader } from "../../../components/tables/interface";
import {
    IGRNCommoditiesAxiosResponse,
    IGRNCommodity,
    IGRNReport,
    IGRNReportTableData
} from "../interface";
import { grnReportsMock } from "../../../mocks/inventory";
import { getTableHeaders } from "../../../components/tables/getTableHeaders";
import moment from "moment";
import { crudStates } from "../../../utils/constants";
import { InventoryContext } from "../../../context/inventory";
import { downloadGoodsReceivedNote, fetchGrnCommoditiesByStockIDService } from "../service";
import { generateGoodsReceivedNote } from "../../../utils/goodReceivedNotes";
import Logo from "../../../statics/images/whitelogo.png"
import RoutesUtills from "../../../core/routes/utills";


const GrnReportUtills = () => {
    const endPoint: string = "grn-reports";
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const { currentInventory, options } = useContext(InventoryContext);
    const header = { plural: 'GRN Report', singular: 'GRN Report' }
    const [stocksTableData, setStocksTableData] = useState<Array<IGRNReportTableData>>([] as Array<IGRNReportTableData>);
    const [filteredGRNCommodities, setFilteredGRNCommodities] = useState<Array<IGRNCommodity>>([] as Array<IGRNCommodity>);
    const { getCurrentUser } = RoutesUtills();
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [currentGRN, setCurrentGRN] = useState<IGRNReport | null>(null);

    const {
        createdBy,
        lastModifiedBy,
        createDate,
        lastModified,
        documentPath,
        id,
        grnDownloaded,
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
            options: options
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
                grnDownloaded,
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
    }, [options]);

    const fetchGrnCommoditiesByStockID = async (id: string | number) => {
        try {
            const response = await fetchGrnCommoditiesByStockIDService(id as string) as IGRNCommoditiesAxiosResponse;
            if (response.status === 200) {
                setFilteredGRNCommodities(response.data.content);
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

    /** Function to find a stock by its ID
    * @param id - The ID of the stock to find
    * @returns The stock object if found, otherwise undefined
    */

    const findGRNById = (id: number | string) => {
        return (currentInventory?.grnReports as Array<IGRNReport>).find((grn) => grn.id === id);
    }

    /** Function to filter GRN commodities by GRN number
    * @param grnNumber - The GRN number to filter by
    * @returns An array of IGRNCommodity objects
    */

    const filterGRNCommoditiesByGRNNumber = (grnNumber: string | number): Array<IGRNCommodity> => {
        return filteredGRNCommodities.filter((commodity) => commodity.grnReport?.name === grnNumber);
    }


    const handleOptionClicked = async (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.download:
                const grnData = {
                    ...currentInventory,
                    reports: filterGRNCommoditiesByGRNNumber(findGRNById(moduleID as number)?.name as string)
                };

                generateGoodsReceivedNote(
                    grnData,
                    Logo,
                    getCurrentUser()?.firstName + " " + getCurrentUser()?.lastName,
                );

                await downloadGoodsReceivedNote(moduleID as number);
                break;
            case crudStates.upload:
                setCurrentGRN(findGRNById(moduleID as number) || null);
                setModalState(option as string);
                handleOpen();
                break;
            case crudStates.read:
                setCurrentGRN(findGRNById(moduleID as number) || null);
                setModalState(option as string);
                handleOpen();
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
        handleOptionClicked,
        modalState,
        open,
        handleClose,
        currentGRN
    }
    )
}

export default GrnReportUtills
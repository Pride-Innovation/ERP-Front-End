import { useEffect, useState } from "react";
import { ITableHeader } from "../../../components/tables/interface";
import { IGRNReport, IGRNReportTableData } from "../interface";
import { grnReportsMock } from "../../../mocks/inventory";
import { getTableHeaders } from "../../../components/tables/getTableHeaders";
import moment from "moment";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { crudStates } from "../../../utils/constants";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

const GrnReportUtills = () => {
    const endPoint: string = "grn-reports";
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    // const { setCurrentInventory } = useContext(InventoryContext);
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
                { value: crudStates.upload, label: "Upload Signed GRN", icon: <ModeEditIcon fontSize='small' color='secondary' /> },
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

    return ({
        columnHeaders,
        endPoint,
        header,
        handleInventoryTableData,
        stocksTableData
    }
    )
}

export default GrnReportUtills
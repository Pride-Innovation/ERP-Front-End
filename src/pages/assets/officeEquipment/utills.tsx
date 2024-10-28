import { useEffect, useState } from "react";
import { ITableHeader } from "../../../components/tables/interface";
import { IFormData } from "../interface";
import { IOfficeEquipment } from "./interface";
import { officeEquipmentMock } from "../../../mocks/officeEquipment";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { getTableHeaders } from "../../../components/tables/getTableHeaders";

const OfficeEquipmentUtills = () => {
    const endPoint = 'posts';
    const module = 'office equipment';
    const header = { plural: 'Office Equipment', singular: 'Office Equipment' };
    const [open, setOpen] = useState<boolean>(false);
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const {
        id,
        hostname,
        detailNetBookValue,
        desc,
        image,
        assetCategory_id,
        unitOfMeasure,
        supplier,
        costOfTheAsset,
        netValueB,
        ...data
    } = officeEquipmentMock[0];

    const rowData = {
        image: officeEquipmentMock[0].image,
        ...data,
        action: {
            label: "options",
            options: [
                { value: "dispose", label: "Dispose", icon: <InfoIcon fontSize='small' color='error' /> },
                { value: "update", label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
                { value: "read", label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' color='inherit' /> }
            ]
        },
    };

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, []);

    const formFields: Array<IFormData<IOfficeEquipment>> = [
        {
            value: "assetName",
            label: 'Asset Name',
            type: "input"
        },
        {
            value: "hostname",
            label: 'Host Name',
            type: "input"
        },
        {
            value: "detailNetBookValue",
            label: 'Detail Net Book Value',
            type: "input"
        },
        {
            value: "engravedNumber",
            label: 'Engraved Number',
            type: "input"
        },
        {
            value: "dateReceipt",
            label: 'Date Receipt',
            type: "date"
        },
        {
            value: "make",
            label: 'Make',
            type: "input"
        },
        {
            value: "assetCategory_id",
            label: 'Category',
            type: "select",
            options: [
                { label: "Truck", value: "truck" },
                { label: "Double Cabin", value: "doubleCabin" },
                { label: "Motor Bike", value: "bike" }
            ]
        },
        {
            value: "supplier",
            label: 'Supplier',
            type: "input"
        },
        {
            value: "unitOfMeasure",
            label: 'Unit of Measure',
            type: "input"
        },
        {
            value: "purchaseCost",
            label: 'Purchase Cost',
            type: "input"
        },
        {
            value: "purchaseCost",
            label: 'Purchase Cost',
            type: "input",
        },
        {
            value: "costOfTheAsset",
            label: 'Cost of Asset',
            type: "input",
        },
        {
            value: "netValueB",
            label: 'Net Value B',
            type: "input",
        },
        {
            value: "desc",
            label: 'Description',
            type: "input",
        },
        {
            value: "assetStatus",
            label: 'Asset Status',
            type: "select",
            options: [
                { label: "In Use", value: "use" },
                { label: "In Store", value: "store" },
                { label: "In Repair", value: "repair" },
                { label: "Disposed/Decommisioned", value: "repair" },
            ]
        }
    ]

    const determineCurrentAsset = (id: number, itemList: Array<IOfficeEquipment>): IOfficeEquipment => {
        const item = itemList.find(item => item.id === id);
        return item as IOfficeEquipment;
    }

    return (
        {
            endPoint,
            header,
            open,
            columnHeaders,
            handleOpen,
            handleClose,
            formFields,
            determineCurrentAsset,
            module
        }
    )
}

export default OfficeEquipmentUtills
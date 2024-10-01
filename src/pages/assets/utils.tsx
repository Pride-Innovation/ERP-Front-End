import { useEffect, useState } from "react";
import { ITableHeader } from "../../components/tables/interface";
import { getTableHeaders } from "../../components/tables/getTableHeaders";
import { assetsMock } from "../../mocks/assets";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { IAsset, IFormData } from "./interface";

const AssetUtills = () => {
    const endPoint = 'posts';
    const header = { plural: 'Assets', singular: 'Asset' };
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);

    const {
        id,
        model,
        serialNo,
        ram,
        cpuSpeed,
        hardDiskSize,
        ipAddress,
        macAddress,
        interfaceType,
        purchaseCost,
        costOfAsset,
        netValue,
        depreciationRate,
        ...data
    } = assetsMock[0];

    const rowData = {
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


    const formFields: Array<IFormData<IAsset>> = [
        {
            value: "name",
            label: 'Asset Name',
            type: "input"
        },
        {
            value: "category",
            label: 'Category',
            type: "select",
            options: [
                { label: "Desktop Computer", value: "desktopComputer" },
                { label: "Laptop", value: "laptop" },
                { label: "Scanner", value: "scanner" },
                { label: "Printer", value: "printer" },
                { label: "Monitor", value: "monitor" },
                { label: "Accesories ( Mouse, Keyboard, etc )", value: "accesories" },
                { label: "Components ( RAM, SSD/HDD, etc )", value: "component" },
                { label: "Receipt Printer", value: "receiptPrinter" },
                { label: "Consumables", value: "consumables" },
                { label: "Office Equipment ( Desk, Chairs, etc)", value: "officeEquipment" },
            ]
        },
        {
            value: "engravedNumber",
            label: 'Engraved number',
            type: "input"
        },
        {
            value: "model",
            label: 'Model',
            type: "input"
        },
        {
            value: "serialNo",
            label: 'Serial Number',
            type: "input"
        },
        {
            value: "status",
            label: 'Status',
            type: "select",
            options: [
                { label: "In Use", value: "use" },
                { label: "In Store", value: "store" },
                { label: "In Repair", value: "repair" },
                { label: "Disposed/Decommisioned", value: "disposed" },
            ]
        },
        {
            value: "netValue",
            label: 'Net Value',
            type: "input"
        },
        {
            value: "depreciationRate",
            label: 'Depreciation Rate',
            type: "input"
        },
        {
            value: "assignedTo",
            label: 'Assigned To',
            type: "input"
        },
        {
            value: "ram",
            label: 'RAM',
            type: "input"
        },
        {
            value: "cpuSpeed",
            label: 'CPU Speed',
            type: "input"
        },
        {
            value: "hardDiskSize",
            label: 'Hard Disk Size',
            type: "input"
        },
        {
            value: "ipAddress",
            label: 'IP Address',
            type: "input"
        },
        {
            value: "interfaceType",
            label: 'Interface Type',
            type: "select",
            options: [
                { label: "USB", value: "usb" },
                { label: "LCD", value: "lcd" },
                { label: "LED", value: "led" },
            ]
        },
        {
            value: "location",
            label: 'Location',
            type: "autocomplete",
            options: [
                { label: "USB", value: "usb" },
                { label: "LCD", value: "lcd" },
                { label: "LED", value: "led" },
            ]
        },
        {
            value: "purchaseCost",
            label: 'Purchase Cost',
            type: "input",
        },
        {
            value: "verificationDate",
            label: 'Verification Date',
            type: "date",
        }
    ]

    return (
        { columnHeaders, endPoint, header, formFields }
    )
}

export default AssetUtills
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { IOptions, ITableHeader } from "../../../components/tables/interface";
import { getTableHeaders } from "../../../components/tables/getTableHeaders";
import { IFormData } from "../interface";
import { IITEquipment, IITEquipmentTableData } from "./interface";
import { itEquipmentMock } from "../../../mocks/itEquipment";
import { crudStates } from "../../../utils/constants";
import { useNavigate } from "react-router";
import { ROUTES } from "../../../core/routes/routes";
import { RootState } from "../../../store";
import moment from "moment";

const ITEquipmentUtills = () => {
    const endPoint = 'assets';
    const module = 'IT Equipment';
    const header = { plural: 'IT Equipment', singular: 'IT Equipment' };
    const [open, setOpen] = useState<boolean>(false);
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [currentAsset, setCurrentAsset] = useState<IITEquipment>({} as IITEquipment);
    const [iTEquipmentTableData, setITEquipmentTableData] = useState<IITEquipmentTableData[]>([] as IITEquipmentTableData[])

    const [optionsObject, setOptionsObject] = useState<{
        assetsStatusesOptions: Array<IOptions>,
        branchesOptions: Array<IOptions>,
        assetTypesOptions: Array<IOptions>,
        usersOptions: Array<IOptions>
        suppliersOptions: Array<IOptions>
    }>({
        assetsStatusesOptions: [],
        branchesOptions: [],
        assetTypesOptions: [],
        usersOptions: [],
        suppliersOptions: []
    });

    const { statuses } = useSelector((state: RootState) => state.StatusesStore);
    const { suppliers } = useSelector((state: RootState) => state.SuppliersStore);
    const { branches } = useSelector((state: RootState) => state.BranchStore);
    const { users } = useSelector((state: RootState) => state.UserStore);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore)
    const navigate = useNavigate()

    useEffect(() => {
        if (statuses.length > 0)
            setOptionsObject({
                assetTypesOptions: assetTypes?.map(type => ({ label: type.name, value: type.id })) || [],
                branchesOptions: branches?.map(branch => ({ label: branch.name, value: branch?.id as number })),
                assetsStatusesOptions: statuses?.map(status => ({ label: status.name, value: status.id as number })) || [],
                usersOptions: users?.map(user => ({ label: `${user.firstName} ${user.lastName}` as string, value: user.id as number })) || [],
                suppliersOptions: suppliers?.map(supplier => ({ label: supplier.name, value: supplier?.id as number })) || [],
            })

    }, [statuses, users, assetTypes, branches, suppliers])

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const categories = {
        desktopComputer: "desktopComputer",
        laptop: "laptop",
        scanner: "scanner",
        printer: "printer",
        monitor: "monitor",
        accesories: "accesories",
        component: "component",
        receiptPrinter: "receiptPrinter",
        consumables: "consumables",
        officeEquipment: "officeEquipment",
    }

    const {
        id,
        branch,
        assignedTo,
        assetType,
        assetStatus,
        supplier,
        description,
        assetDepreciationRate,
        interfaceType,
        ipAddress,
        macAddress,
        hardDiskSize,
        hostname,
        cpuSpeed,
        ram,
        detailNetBookValue,
        netValueB,
        unitOfMeasure,
        image,
        ...data
    } = itEquipmentMock[0];

    const rowData = {
        ...data,
        assetStatus: itEquipmentMock[0].assetStatus?.name,
        assignedTo: itEquipmentMock[0].assignedTo?.firstName,
        location: "",
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


    const handleITEquipmentTableData = (list: Array<IITEquipment>) => {
        const data: Array<IITEquipmentTableData> = list.map((item, index) => {
            const {
                branch,
                assignedTo,
                assetType,
                assetStatus,
                supplier,
                description,
                assetDepreciationRate,
                interfaceType,
                ipAddress,
                macAddress,
                hardDiskSize,
                hostname,
                cpuSpeed,
                ram,
                detailNetBookValue,
                netValueB,
                unitOfMeasure,
                image,
                ...fielsdata
            } = list[index];

            return (
                {
                    ...fielsdata,
                    assetName: item.assetName,
                    engravedNumber: item.engravedNumber,
                    dateReceived: moment(item.dateReceipt).format('Do MMMM YYYY'),
                    make: item.make,
                    purchaseCost: item.purchaseCost,
                    costOfAsset: item.costOfTheAsset,
                    model: item.model as string,
                    serialNumber: item.serialNumber as string,
                    status: item?.assetStatus?.status as string,
                    assignedTo: `${item.assignedTo?.lastName} ${item.assignedTo?.firstName}`,
                    location: item.branch?.name as string
                }
            )
        })
        setITEquipmentTableData(data);

    }

    const handleOptionClicked = async (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.update:
                navigate(`${ROUTES.UPDATE_ITEQUIPMENT}/${moduleID}`);
                break;
            case crudStates.dispose:
                // setCurrentAsset(determineCurrentAsset(moduleID as number, rows as IITEquipment[]))
                handleOpen();
                break;
            case crudStates.read:
                navigate(`${ROUTES.LIST_ASSETS}/${moduleID}`);
                break;
            case crudStates.delete:
                // const response = await deleteITEquipmentService(moduleID as number);
                // console.log(response, "response information")
                break;
            default:
                break;
        }
    }


    const formFields: Array<IFormData<IITEquipment>> = [
        {
            value: "category",
            label: 'Category',
            type: "select",
            options: [
                { label: "Desktop Computer", value: categories.desktopComputer },
                { label: "Laptop", value: categories.laptop },
                { label: "Scanner", value: categories.scanner },
                { label: "Printer", value: categories.printer },
                { label: "Monitor", value: categories.monitor },
                { label: "Accesories ( Mouse, Keyboard, etc )", value: categories.accesories },
                { label: "Components ( RAM, SSD/HDD, etc )", value: categories.component },
                { label: "Receipt Printer", value: categories.receiptPrinter },
            ]
        },
        {
            value: "assetName",
            label: 'Asset Name',
            type: "input"
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
            value: "serialNumber",
            label: 'Serial Number',
            type: "input"
        },
        {
            value: "unitOfMeasure",
            label: 'Unit of Measure',
            type: "input"
        },
        {
            value: "assetStatus",
            label: 'Status',
            type: "select",
            options: optionsObject.assetsStatusesOptions
        },
        {
            value: "netValueB",
            label: 'Net Value',
            type: "input"
        },
        {
            value: "assetDepreciationRate",
            label: 'Depreciation Rate',
            type: "input"
        },
        {
            value: "assignedTo",
            label: 'Assigned To',
            type: "select",
            options: optionsObject.usersOptions
        },
        {
            value: "branch",
            label: 'Branch',
            type: "select",
            options: optionsObject.branchesOptions
        },
        {
            value: "purchaseCost",
            label: 'Purchase Cost',
            type: "number",
        },
        {
            value: "hostname",
            label: 'Host Name',
            type: "input",
        },
        {
            value: "detailNetBookValue",
            label: 'Detail Net Book Value',
            type: "input",
        },
        {
            value: "dateReceipt",
            label: 'Receipt Date',
            type: "date",
        },
        {
            value: "costOfTheAsset",
            label: 'Cost Of The Asset',
            type: "number",
        },
        {
            value: "make",
            label: 'Make',
            type: "input",
        },
        {
            value: "supplier",
            label: 'Supplier',
            type: "select",
            options: optionsObject.suppliersOptions
        }
    ]

    const computerFields: Array<IFormData<IITEquipment>> = [
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
    ]

    const determineCurrentAsset = (id: number, itemList: Array<IITEquipment>): IITEquipment => {
        const item = itemList.find(item => item.id === id);
        return item as IITEquipment;
    }

    return (
        {
            open,
            setOpen,
            handleClose,
            handleOpen,
            endPoint,
            header,
            columnHeaders,
            formFields,
            computerFields,
            categories,
            determineCurrentAsset,
            module,
            handleOptionClicked,
            currentAsset,
            handleRequest: handleITEquipmentTableData,
            iTEquipmentTableData
        }
    )
}

export default ITEquipmentUtills;
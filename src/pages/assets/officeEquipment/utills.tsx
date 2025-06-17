/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { IOptions, ITableHeader } from "../../../components/tables/interface";
import { IFormData } from "../interface";
import { IOfficeEquipment, IOfficeEquipmentTableData } from "./interface";
import { officeEquipmentMock } from "../../../mocks/officeEquipment";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { getTableHeaders } from "../../../components/tables/getTableHeaders";
import { crudStates } from "../../../utils/constants";
import { ROUTES } from "../../../core/routes/routes";
import { useNavigate } from "react-router";
import moment from "moment";

const OfficeEquipmentUtills = () => {
    const endPoint = 'assets';
    const module = 'office equipment';
    const header = { plural: 'Office Equipment', singular: 'Office Equipment' };
    const [open, setOpen] = useState<boolean>(false);
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [currentAsset, setCurrentAsset] = useState<IOfficeEquipment>({} as IOfficeEquipment);
    const [officeEquipmentTableData, setOfficeEquipmentTableData] = useState<IOfficeEquipmentTableData[]>([] as IOfficeEquipmentTableData[])

    const [optionsObject, setOptionsObject] = useState<{
        assetsStatusesOptions: Array<IOptions>,
        branchesOptions: Array<IOptions>,
        assetCategoriesOptions: Array<IOptions>,
        usersOptions: Array<IOptions>
        suppliersOptions: Array<IOptions>
    }>({
        assetsStatusesOptions: [],
        branchesOptions: [],
        assetCategoriesOptions: [],
        usersOptions: [],
        suppliersOptions: []
    });

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const navigate = useNavigate()
    const {
        id,
        branch,
        assignedTo,
        assetType,
        assetStatus,
        supplier,
        description,
        assetDepreciationRate,
        detailNetBookValue,
        netValueB,
        unitOfMeasure,
        image,
        ...data
    } = officeEquipmentMock[0];

    const rowData = {
        ...data,
        status: officeEquipmentMock[0].assetStatus?.name,
        assignedTo: officeEquipmentMock[0].assignedTo?.firstName,
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

    const handleOfficeEquipmentTableData = (list: Array<IOfficeEquipment>) => {
        const data: Array<IOfficeEquipmentTableData> = list.map((item, index) => {
            const {
                branch,
                assignedTo,
                assetType,
                assetStatus,
                supplier,
                description,
                assetDepreciationRate,
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
                    status: item?.assetStatus?.status as string,
                    assignedTo: `${item.assignedTo?.lastName} ${item.assignedTo?.firstName}`,
                    location: item.branch?.name as string
                }
            )
        })
        setOfficeEquipmentTableData(data);

    }

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
            value: "assetStatus",
            label: 'status',
            type: "select",
            options: optionsObject.assetCategoriesOptions
        },
        {
            value: "assetType",
            label: 'Asset Type',
            type: "select",
            options: optionsObject.assetCategoriesOptions
        },
        {
            value: "supplier",
            label: 'Supplier',
            type: "select",
            options: optionsObject.suppliersOptions
        },
        {
            value: "purchaseCost",
            label: 'Purchase Cost',
            type: "number",
        },
        {
            value: "costOfTheAsset",
            label: 'Cost of Asset',
            type: "number",
        },
        {
            value: "netValueB",
            label: 'Net Value B',
            type: "input",
        },
        {
            value: "description",
            label: 'Description',
            type: "input",
        },
        {
            value: "assetStatus",
            label: 'Status',
            type: "select",
            options: optionsObject.assetsStatusesOptions
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
    ]

    const determineCurrentAsset = (id: number, itemList: Array<IOfficeEquipment>): IOfficeEquipment => {
        const item = itemList.find(item => item.id === id);
        return item as IOfficeEquipment;
    }

    const handleOptionClicked = async (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.update:
                navigate(`${ROUTES.UPDATE_OFFICE_EQUIPMENT}/${moduleID}`)
                break;
            case crudStates.dispose:
                // setCurrentAsset(determineCurrentAsset(moduleID as number, rows as IOfficeEquipment[]))
                handleOpen()
                break;
            case crudStates.read:
                navigate(`${ROUTES.LIST_OFFICE_EQUIPMENT}/${moduleID}`);
                break;
            case crudStates.delete:
                // const response = await deleteOfficeEquipmentService(moduleID as number);
                // console.log(response, "Item deleted successfully!!")
                break;
            default:
                break;
        }
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
            module,
            handleOptionClicked,
            currentAsset,
            officeEquipmentTableData,
            handleOfficeEquipmentTableData
        }
    )
}

export default OfficeEquipmentUtills
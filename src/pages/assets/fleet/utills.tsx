/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { IOptions, ITableHeader } from "../../../components/tables/interface";
import { fleetsMock } from "../../../mocks/fleet";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { getTableHeaders } from "../../../components/tables/getTableHeaders";
import { IFormData } from "../interface";
import { IFleet, IFleetTableData } from "./interface";
import { crudStates } from "../../../utils/constants";
import { useNavigate } from "react-router";
import { ROUTES } from "../../../core/routes/routes";
import moment from "moment";

const FleetUtills = () => {
    const endPoint = 'assets';
    const module = "fleet";
    const header = { plural: 'Fleet', singular: 'Fleet' };
    const [open, setOpen] = useState<boolean>(false);
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [fleetTableData, setFleetTableData] = useState<IFleetTableData[]>([] as IFleetTableData[])

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
    } = fleetsMock[0];

    const rowData = {
        ...data,
        status: fleetsMock[0].assetStatus?.name,
        assignedTo: fleetsMock[0].assignedTo?.firstName,
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


    const handleFleetTableData = (list: Array<IFleet>) => {
        const data: Array<IFleetTableData> = list.map((item, index) => {
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
                    model: item.model as string,
                    purchaseCost: item.purchaseCost,
                    costOfAsset: item.costOfTheAsset,
                    status: item?.assetStatus?.status as string,
                    assignedTo: `${item.assignedTo?.lastName} ${item.assignedTo?.firstName}`,
                    location: item.branch?.name as string
                }
            )
        })
        setFleetTableData(data);

    }


    const formFields: Array<IFormData<IFleet>> = [
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

    const determineCurrentAsset = (id: number, itemList: Array<IFleet>): IFleet => {
        const item = itemList.find(item => item.id === id);
        return item as IFleet;
    }


    const handleOptionClicked = (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.update:
                navigate(`${ROUTES.UPDATE_FLEET}/${moduleID}`)
                break;
            case crudStates.dispose:
                // setCurrentAsset(determineCurrentAsset(moduleID as number, rows as IFleet[]))
                handleOpen();
                break;
            case crudStates.read:
                navigate(`${ROUTES.LIST_FLEET}/${moduleID}`)
                break;
            default:
                break;
        }
    }

    return (
        {
            endPoint,
            open,
            handleClose,
            handleOpen,
            columnHeaders,
            header,
            formFields,
            determineCurrentAsset,
            module,
            handleOptionClicked,
            fleetTableData,
            handleFleetTableData
        }
    )
}

export default FleetUtills;
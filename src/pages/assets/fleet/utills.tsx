/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from "react";
import { IOptions, ITableHeader } from "../../../components/tables/interface";
import { fleetsMock } from "../../../mocks/fleet";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { getTableHeaders } from "../../../components/tables/getTableHeaders";
import { IFormData } from "../interface";
import { IFleet, IFleetTableData } from "./interface";
import { assetTypesStatusConstants, crudStates, unitsOfMeasure } from "../../../utils/constants";
import { useNavigate } from "react-router";
import { ROUTES } from "../../../core/routes/routes";
import moment from "moment";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { IAssetType } from "../../settings/assetTypes/interface";
import { AutocompleteContext } from "../../../context/autocomplete";
import AssetUtills from "../Utills";
import { determineBranchName } from "../../../utils/helpers";
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

const FleetUtills = () => {
    const endPoint = 'assets';
    const module = "Fleet";
    const header = { plural: 'Fleet', singular: 'Fleet' };
    const [open, setOpen] = useState<boolean>(false);
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [fleetTableData, setFleetTableData] = useState<IFleetTableData[]>([] as IFleetTableData[])
    const { selectedItemDetails, value, inputValue, label } = useContext(AutocompleteContext)
    const [currentAsset, setCurrentAsset] = useState<IFleet>({} as IFleet);
    const [currentState, setCurrentState] = useState<string>("");

    const {
        searchStockByLPONumber,
        searchUserByName,
        searchBranchByName,
        searchSupplierByName
    } = AssetUtills();


    const [optionsObject, setOptionsObject] = useState<{
        assetsStatusesOptions: Array<IOptions>,
        branchesOptions: Array<IOptions>,
        usersOptions: Array<IOptions>
        suppliersOptions: Array<IOptions>
        assetTypesOptions: Array<IOptions>,
        commoditiesOptions: Array<IOptions>
        inventoryOptions: Array<IOptions>
    }>({
        assetsStatusesOptions: [],
        branchesOptions: [],
        usersOptions: [],
        assetTypesOptions: [],
        suppliersOptions: [],
        commoditiesOptions: [],
        inventoryOptions: []
    });

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const { statuses } = useSelector((state: RootState) => state.StatusesStore);
    const { suppliers } = useSelector((state: RootState) => state.SuppliersStore);
    const { branches } = useSelector((state: RootState) => state.BranchStore);
    const { users } = useSelector((state: RootState) => state.UserStore);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore)
    const { commodities } = useSelector((state: RootState) => state.CommodityStore)
    const { inventory } = useSelector((state: RootState) => state.InventoryStore)
    const { fleetAssets } = useSelector((state: RootState) => state.FleetStore)

    const navigate = useNavigate()


    useEffect(() => {
        if (statuses.length > 0)
            setOptionsObject({
                assetTypesOptions: assetTypes?.map(type => ({ label: type.name, value: type.id as number })) || [],
                branchesOptions: branches?.map(branch => ({ label: branch.name, value: branch?.id as number })),
                assetsStatusesOptions: statuses?.map(status => ({ label: status.name, value: status.id as number })) || [],
                usersOptions: users?.map(user => ({ label: `${user.firstName} ${user.lastName}` as string, value: user.id as number })) || [],
                suppliersOptions: suppliers?.map(supplier => ({ label: supplier.name, value: supplier?.id as number })) || [],
                commoditiesOptions: commodities?.map(supplier => ({ label: supplier.name, value: supplier?.id as number })) || [],
                inventoryOptions: inventory?.map(invent => ({ label: invent.lpoNumber, value: invent?.lpoNumber as string })) || [],
            })

    }, [statuses, users, assetTypes, branches, suppliers, commodities, inventory])

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
        dateReceipt,
        image,
        stock,
        commodity,
        purchaseCost,
        costOfTheAsset,
        hostname,
        lpoNumber,
        make,
        model,
        assetName,
        engravedNumber,
        ...data
    } = fleetsMock[0];

    const rowData = {
        ...data,
        assetName,
        manufacturer: make,
        engravedNumber,
        model,
        dateReceived: "",
        location: "",
        assignedTo: fleetsMock[0].assignedTo?.firstName,
        status: fleetsMock[0].assetStatus?.name,
        action: {
            label: "options",
            options: [
                { value: "dispose", label: "Dispose", icon: <InfoIcon fontSize='small' color='error' /> },
                { value: "update", label: "Update", icon: <ModeEditIcon fontSize='small' color='info' /> },
                { value: "read", label: "View Details", icon: <RemoveRedEyeIcon fontSize='small' color='inherit' /> },
                { value: crudStates.reassign, label: "Reassign", icon: <AssignmentIndOutlinedIcon fontSize='small' color='secondary' /> },
                { value: crudStates.repair, label: "Repair", icon: <BuildOutlinedIcon fontSize='small' color='primary' /> },
                { value: crudStates.inStore, label: "Send to Store", icon: <HomeOutlinedIcon fontSize='small' color='action' /> },
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
                dateReceipt,
                image,
                stock,
                commodity,
                purchaseCost,
                costOfTheAsset,
                hostname,
                lpoNumber,
                make,
                model,
                assetName,
                engravedNumber,
                ...fielsdata
            } = list[index];

            return (
                {
                    ...fielsdata,
                    assetName: item.assetName,
                    engravedNumber: item.engravedNumber,
                    dateReceived: moment(item.dateReceipt).format('Do MMMM YYYY'),
                    make: item.make as string,
                    model: item.model as string,
                    purchaseCost: item.purchaseCost,
                    costOfAsset: item.costOfTheAsset,
                    status: item?.assetStatus?.status as string,
                    assignedTo: item.assignedTo?.firstName ? `${item.assignedTo?.lastName} ${item.assignedTo?.firstName}` : "",
                    location: determineBranchName(item),
                    manufacturer: item.make as string,
                }
            )
        })
        setFleetTableData(data);

    }


    /**
     * Determine that there is a search text.
     * If the text is equal to an LPO number, then the 
     * user has selected an existing Stock, but if the 
     * text is not equal to an LPO number then the user is searching
     */

    useEffect(() => {
        if (inputValue.length > 0
            && selectedItemDetails.id
            && value?.value
            && (inputValue === selectedItemDetails.id)
            && (inputValue === value?.value)
        ) {
            console.log(
                "Selected Item",
                inputValue,
                selectedItemDetails,
                value
            )
        }
        else if (inputValue.length > 0) {

            switch (label) {
                case "LPO Number":
                    searchStockByLPONumber(inputValue);
                    break;
                case "Branch":
                    searchBranchByName(inputValue);
                    break;
                case "Supplier":
                    searchSupplierByName(inputValue);
                    break;
                case "Assigned To":
                    /**
                     * Ensure that only first name 
                     * TO DO -> Also filter by last name
                     */
                    if (inputValue.split(" ").length < 2) {
                        searchUserByName(inputValue);
                    }
                    break;
                default:
                    break;
            }
        }

    }, [inputValue])

    const formFields: Array<IFormData<IFleet>> = [
        {
            value: "category",
            label: 'Select Category',
            type: "select",
            options: optionsObject.commoditiesOptions
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
            value: "unitOfMeasure",
            label: 'Unit of Measure',
            type: "select",
            options: unitsOfMeasure
        },
        {
            value: "netValueB",
            label: 'Net Value',
            type: "input",
            required: false
        },
        {
            value: "assetDepreciationRate",
            label: 'Depreciation Rate',
            type: "input",
            required: false
        },
        {
            value: "branch",
            label: 'Branch',
            type: "autocomplete",
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
            required: false
        },
        {
            value: "detailNetBookValue",
            label: 'Detail Net Book Value',
            type: "input",
            required: false
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
            required: false
        },
        {
            value: "supplier",
            label: 'Supplier',
            type: "autocomplete",
            options: optionsObject.suppliersOptions
        },
        {
            value: "lpoNumber",
            label: 'LPO Number',
            type: "autocomplete",
            options: optionsObject.inventoryOptions,
            disabled: true
        },
        {
            value: "serialNumber",
            label: 'Chasis Number',
            type: "input",
            required: false
        }
    ]

    const determineCurrentAsset = (id: number, itemList: Array<IFleet>): IFleet => {
        const item = itemList.find(item => item.id === id);
        return item as IFleet;
    }

    const determineFleetAssetType = () => {
        return assetTypes.find(assetType => assetType
            .name.toLocaleLowerCase()
            .indexOf(assetTypesStatusConstants.fleet.toLocaleLowerCase()) !== -1) as IAssetType
    }

    const handleOptionClicked = (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.update:
                navigate(`${ROUTES.UPDATE_FLEET}/${moduleID}`)
                break;
            case crudStates.read:
                navigate(`${ROUTES.LIST_FLEET}/${moduleID}`);
                break;
            case crudStates.dispose:
                setCurrentAsset(determineCurrentAsset(moduleID as number, fleetAssets as IFleet[]))
                setCurrentState(crudStates.dispose);
                handleOpen();
                break;
            case crudStates.reassign:
                setCurrentAsset(determineCurrentAsset(moduleID as number, fleetAssets as IFleet[]))
                setCurrentState(crudStates.reassign);
                handleOpen();
                break;
            case crudStates.repair:
                setCurrentAsset(determineCurrentAsset(moduleID as number, fleetAssets as IFleet[]))
                setCurrentState(crudStates.repair);
                handleOpen();
                break;
            case crudStates.inStore:
                setCurrentAsset(determineCurrentAsset(moduleID as number, fleetAssets as IFleet[]))
                setCurrentState(crudStates.inStore);
                handleOpen();
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
            handleFleetTableData,
            determineFleetAssetType,
            currentAsset,
            currentState
        }
    )
}

export default FleetUtills;
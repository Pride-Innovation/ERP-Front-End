/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IOptions, ITableHeader } from "../../../components/tables/interface";
import { getTableHeaders } from "../../../components/tables/getTableHeaders";
import { IFormData } from "../interface";
import { IITEquipment, IITEquipmentTableData } from "./interface";
import { itEquipmentMock } from "../../../mocks/itEquipment";
import { assetTypesStatusConstants, crudStates, unitsOfMeasure } from "../../../utils/constants";
import { useNavigate } from "react-router";
import { ROUTES } from "../../../core/routes/routes";
import { RootState } from "../../../store";
import moment from "moment";
import { IAssetType } from "../../settings/assetTypes/interface";
import { AutocompleteContext } from "../../../context/autocomplete";
import AssetUtills from "../Utills";
import { determineBranchName } from "../../../utils/helpers";
import { AssetContext } from "../../../context/asset";


const ITEquipmentUtills = () => {
    const endPoint = 'assets';
    const module = 'IT Equipment';
    const header = { plural: 'IT Equipment', singular: 'IT Equipment' };
    const [open, setOpen] = useState<boolean>(false);
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [currentAsset, setCurrentAsset] = useState<IITEquipment>({} as IITEquipment);
    const [iTEquipmentTableData, setITEquipmentTableData] = useState<IITEquipmentTableData[]>([] as IITEquipmentTableData[])
    const { selectedItemDetails, value, inputValue, label } = useContext(AutocompleteContext)
    const [currentState, setCurrentState] = useState<string>("");
    const { options } = useContext(AssetContext);

    const {
        searchStockByLPONumber,
        searchUserByName,
        searchBranchByName,
        searchSupplierByName
    } = AssetUtills();

    const [optionsObject, setOptionsObject] = useState<{
        assetsStatusesOptions: Array<IOptions>,
        branchesOptions: Array<IOptions>,
        assetTypesOptions: Array<IOptions>,
        usersOptions: Array<IOptions>
        suppliersOptions: Array<IOptions>
        commoditiesOptions: Array<IOptions>
        inventoryOptions: Array<IOptions>
    }>({
        assetsStatusesOptions: [],
        branchesOptions: [],
        assetTypesOptions: [],
        usersOptions: [],
        suppliersOptions: [],
        commoditiesOptions: [],
        inventoryOptions: [],
    });

    const { statuses } = useSelector((state: RootState) => state.StatusesStore);
    const { suppliers } = useSelector((state: RootState) => state.SuppliersStore);
    const { branches } = useSelector((state: RootState) => state.BranchStore);
    const { users } = useSelector((state: RootState) => state.UserStore);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore)
    const { commodities } = useSelector((state: RootState) => state.CommodityStore)
    const { inventory } = useSelector((state: RootState) => state.InventoryStore)
    const { itAssets } = useSelector((state: RootState) => state.ITAssetStore)


    const navigate = useNavigate()

    useEffect(() => {
        if (statuses.length > 0)
            setOptionsObject({
                assetTypesOptions: assetTypes?.map(type => ({ label: type.name, value: type.id })) || [],
                branchesOptions: branches?.map(branch => ({ label: branch.name, value: branch?.id as number })),
                assetsStatusesOptions: statuses?.map(status => ({ label: status.name, value: status.id as number })) || [],
                usersOptions: users?.map(user => ({ label: `${user.firstName} ${user.lastName}` as string, value: user.id as number })) || [],
                suppliersOptions: suppliers?.map(supplier => ({ label: supplier.name, value: supplier?.id as number })) || [],
                commoditiesOptions: commodities?.map(commodity => ({ label: commodity.name, value: commodity?.id as number })) || [],
                inventoryOptions: inventory?.map(invent => ({ label: invent.lpoNumber, value: invent?.lpoNumber as string })) || [],
            })

    }, [statuses, users, assetTypes, branches, suppliers, commodities, inventory])

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const categories = {
        desktopComputer: "desktop",
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
        lpoNumber,
        stock,
        dateReceipt,
        commodity,
        image,
        purchaseCost,
        costOfTheAsset,
        serialNumber,
        make,
        assetName,
        engravedNumber,
        model,
        ...data
    } = itEquipmentMock[0];

    const rowData = {
        ...data,
        assetName,
        manufacturer: make,
        engravedNumber,
        model,
        serialNumber: serialNumber as string,
        dateReceived: "",
        location: "",
        assignedTo: itEquipmentMock[0].assignedTo?.firstName,
        status: itEquipmentMock[0].assetStatus?.name,
        action: {
            label: "options",
            options: options
        },
    };


    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData))
    }, [options]);


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
                lpoNumber,
                stock,
                commodity,
                dateReceipt,
                serialNumber,
                make,
                assetName,
                engravedNumber,
                model,
                image,
                ...fielsdata
            } = list[index];

            return (
                {
                    ...fielsdata,
                    assetName: item.assetName,
                    engravedNumber: item.engravedNumber,
                    dateReceived: moment(item.dateReceipt).format('Do MMMM YYYY'),
                    // make: item.make,
                    // purchaseCost: item.purchaseCost,
                    // costOfAsset: item.costOfTheAsset,
                    serialNumber: item.serialNumber as string,
                    model: item.model as string,
                    status: item?.assetStatus?.status as string,
                    assignedTo: item.assignedTo?.firstName ? `${item.assignedTo?.lastName} ${item.assignedTo?.firstName}` : "",
                    location: determineBranchName(item),
                    manufacturer: item.make as string,
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
            case crudStates.read:
                navigate(`${ROUTES.LIST_ASSETS}/${moduleID}`);
                break;
            case crudStates.dispose:
                setCurrentAsset(determineCurrentAsset(moduleID as number, itAssets as IITEquipment[]))
                setCurrentState(crudStates.dispose);
                handleOpen();
                break;
            case crudStates.reassign:
                setCurrentAsset(determineCurrentAsset(moduleID as number, itAssets as IITEquipment[]))
                setCurrentState(crudStates.reassign);
                handleOpen();
                break;
            case crudStates.repair:
                setCurrentAsset(determineCurrentAsset(moduleID as number, itAssets as IITEquipment[]))
                setCurrentState(crudStates.repair);
                handleOpen();
                break;
            case crudStates.inStore:
                setCurrentAsset(determineCurrentAsset(moduleID as number, itAssets as IITEquipment[]))
                setCurrentState(crudStates.inStore);
                handleOpen();
                break;
            default:
                break;
        }
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


    const formFields: Array<IFormData<IITEquipment>> = [
        {
            value: "category",
            label: 'Category',
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
            type: "select",
            options: unitsOfMeasure
        },
        {
            value: "netValueB",
            label: 'Net Value',
            type: "input",
            required: false,
        },
        {
            value: "assetDepreciationRate",
            label: 'Depreciation Rate',
            type: "input",
            required: false,
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
            required: false,
        },
        {
            value: "detailNetBookValue",
            label: 'Detail Net Book Value',
            type: "input",
            required: false,
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
            type: "autocomplete",
            options: optionsObject.suppliersOptions
        },
        {
            value: "lpoNumber",
            label: 'LPO Number',
            type: "autocomplete",
            options: optionsObject.inventoryOptions,
            disabled: true,
            required: false,
        }
    ]

    const computerFields: Array<IFormData<IITEquipment>> = [
        {
            value: "ram",
            label: 'RAM',
            type: "input",
            required: false,
        },
        {
            value: "cpuSpeed",
            label: 'CPU Speed',
            type: "input",
            required: false,
        },
        {
            value: "hardDiskSize",
            label: 'Hard Disk Size',
            type: "input",
            required: false,
        },
        {
            value: "ipAddress",
            label: 'IP Address',
            type: "input",
            required: false,
        },
        {
            value: "interfaceType",
            label: 'Interface Type',
            type: "select",
            options: [
                { label: "USB", value: "usb" },
                { label: "LCD", value: "lcd" },
                { label: "LED", value: "led" },
            ],
            required: false,
        },
    ]

    const determineCurrentAsset = (id: number, itemList: Array<IITEquipment>): IITEquipment => {
        const item = itemList.find(item => item.id === id);
        return item as IITEquipment;
    }

    const determineITAssetType = () => {
        return assetTypes.find(assetType => assetType
            .name.toLocaleLowerCase()
            .indexOf(assetTypesStatusConstants.itEquipment.toLocaleLowerCase()) !== -1) as IAssetType
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
            iTEquipmentTableData,
            determineITAssetType,
            currentState,
        }
    )
}

export default ITEquipmentUtills;
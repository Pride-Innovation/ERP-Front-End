/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useEffect, useState } from "react";
import { IOptions, ITableHeader } from "../../../components/tables/interface";
import { IFormData } from "../interface";
import { IOfficeEquipment, IOfficeEquipmentTableData } from "./interface";
import { officeEquipmentMock } from "../../../mocks/officeEquipment";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { getTableHeaders } from "../../../components/tables/getTableHeaders";
import { assetTypesStatusConstants, crudStates } from "../../../utils/constants";
import { ROUTES } from "../../../core/routes/routes";
import { useNavigate } from "react-router";
import moment from "moment";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { IAssetType } from "../../settings/assetTypes/interface";
import { AutocompleteContext } from "../../../context/autocomplete";
import AssetUtills from "../Utills";

const OfficeEquipmentUtills = () => {
    const endPoint = 'assets';
    const module = 'office equipment';
    const header = { plural: 'Office Equipment', singular: 'Office Equipment' };
    const [open, setOpen] = useState<boolean>(false);
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [currentAsset, setCurrentAsset] = useState<IOfficeEquipment>({} as IOfficeEquipment);
    const [officeEquipmentTableData, setOfficeEquipmentTableData] = useState<IOfficeEquipmentTableData[]>([] as IOfficeEquipmentTableData[])
    const { selectedItemDetails, value, inputValue, label } = useContext(AutocompleteContext)
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
        commoditiesOptions: Array<IOptions>,
        inventoryOptions: Array<IOptions>
    }>({
        assetsStatusesOptions: [],
        branchesOptions: [],
        usersOptions: [],
        assetTypesOptions: [],
        suppliersOptions: [],
        commoditiesOptions: [],
        inventoryOptions: [],
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
        lpoNumber,
        stock,
        commodity,
        dateReceipt,
        image,
        ...data
    } = officeEquipmentMock[0];

    const rowData = {
        ...data,
        dateReceived: "",
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
                lpoNumber,
                stock,
                commodity,
                dateReceipt,
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

    const formFields: Array<IFormData<IOfficeEquipment>> = [
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
            type: "input"
        },
        {
            value: "assetStatus",
            label: 'Status',
            type: "select",
            options: optionsObject.assetsStatusesOptions
        },
        {
            value: "assetType",
            label: 'Asset Type',
            type: "select",
            options: optionsObject.assetTypesOptions
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
            type: "autocomplete",
            options: optionsObject.usersOptions
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
            type: "autocomplete",
            options: optionsObject.suppliersOptions
        },
        {
            value: "lpoNumber",
            label: 'LPO Number',
            type: "autocomplete",
            options: optionsObject.inventoryOptions,
            disabled: true
        }
    ]

    const determineCurrentAsset = (id: number, itemList: Array<IOfficeEquipment>): IOfficeEquipment => {
        const item = itemList.find(item => item.id === id);
        return item as IOfficeEquipment;
    }

    const determineOfficeAssetType = () => {
        return assetTypes.find(assetType => assetType
            .name.toLocaleLowerCase()
            .indexOf(assetTypesStatusConstants.officeEquipment.toLocaleLowerCase()) !== -1) as IAssetType
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
            handleOfficeEquipmentTableData,
            determineOfficeAssetType
        }
    )
}

export default OfficeEquipmentUtills
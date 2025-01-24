import { useEffect, useState } from "react";
import { IOptions, ITableHeader } from "../../../components/tables/interface";
import { fleetsMock } from "../../../mocks/fleet";
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { getTableHeaders } from "../../../components/tables/getTableHeaders";
import { IFormData } from "../interface";
import { IFleet } from "./interface";
import { RootState } from "../../../store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
    loadAssetCategories,
    loadAssetStatuses,
    loadBranches,
    loadSuppliers,
    loadUnitOfMeasures,
    loadUsers
} from "../slice";
import {
    listAssetStatusesService,
    listBranchesService,
    listCategoriesService,
    listSuppliersService,
    listUnitOfMeasuresService,
    listUsersService
} from "../ITEquipment/service";

const FleetUtills = () => {
    const endPoint = 'posts';
    const module = "fleet";
    const header = { plural: 'Fleet', singular: 'Fleet' };
    const [open, setOpen] = useState<boolean>(false);
    const dispatch = useDispatch()
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [optionsObject, setOptionsObject] = useState<{
        assetsStatusesOptions: Array<IOptions>,
        branchesOptions: Array<IOptions>,
        assetCategoriesOptions: Array<IOptions>,
        unitsOfMeasuresOptions: Array<IOptions>
        usersOptions: Array<IOptions>
        suppliersOptions: Array<IOptions>
    }>({
        assetsStatusesOptions: [],
        branchesOptions: [],
        assetCategoriesOptions: [],
        unitsOfMeasuresOptions: [],
        usersOptions: [],
        suppliersOptions: []
    });
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const {
        assetsStatuses,
        users,
        assetCategories,
        unitsOfMeasures,
        branches,
        suppliers
    } = useSelector((state: RootState) => state.EquipmentStore);

    const updateReduxStore = async () => {
        dispatch(loadBranches(await listBranchesService()));
        dispatch(loadUsers(await listUsersService()));
        dispatch(loadAssetCategories(await listCategoriesService()));
        dispatch(loadUnitOfMeasures(await listUnitOfMeasuresService()));
        dispatch(loadAssetStatuses(await listAssetStatusesService()));
        dispatch(loadSuppliers(await listSuppliersService()));
    }

    useEffect(() => { updateReduxStore() }, []);

    useEffect(() => {
        setOptionsObject({
            assetCategoriesOptions: assetCategories?.map(category => ({ label: category.name, value: category.id })) || [],
            branchesOptions: branches?.map(branch => ({ label: branch.name, value: branch?.id as number })),
            assetsStatusesOptions: assetsStatuses?.map(status => ({ label: status.name, value: status.id })) || [],
            unitsOfMeasuresOptions: unitsOfMeasures?.map(unit => ({ label: unit.name, value: unit.id })) || [],
            usersOptions: users?.map(user => ({ label: user.name as string, value: user.id as number })) || [],
            suppliersOptions: suppliers?.map(supplier => ({ label: supplier.name, value: supplier.id })) || [],
        })

    }, [assetsStatuses, users, assetCategories, unitsOfMeasures, branches, suppliers])
    const {
        id,
        hostname,
        detailNetBookValue,
        desc,
        image,
        assetCategory_id,
        unitOfMeasure,
        supplier,
        name,
        costOfTheAsset,
        netValueB,
        purchaseCost,
        ...data
    } = fleetsMock[0];

    const rowData = {
        image,
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
            value: "assetCategory_id",
            label: 'Category',
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
            value: "unitOfMeasure",
            label: 'Unit of Measure',
            type: "select",
            options: optionsObject.unitsOfMeasuresOptions
        },
        {
            value: "purchaseCost",
            label: 'Purchase Cost',
            type: "input"
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
            value: "registrationNumber",
            label: 'Registration Number',
            type: "input",
        },
        {
            value: "model",
            label: 'Model',
            type: "input",
        },
        {
            value: "assetStatus",
            label: 'Status',
            type: "select",
            options: optionsObject.assetsStatusesOptions
        },
        {
            value: "user_id",
            label: 'Assigned To',
            type: "select",
            options: optionsObject.usersOptions
        },
        {
            value: "branch_id",
            label: 'Branch',
            type: "select",
            options: optionsObject.branchesOptions
        },
    ]

    const determineCurrentAsset = (id: number, itemList: Array<IFleet>): IFleet => {
        const item = itemList.find(item => item.id === id);
        return item as IFleet;
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
            module
        }
    )
}

export default FleetUtills;
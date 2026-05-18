import { useContext, useEffect, useState } from "react";
import { ITableHeader } from "../../../components/tables/interface";
import { IOfficeEquipment, IOfficeEquipmentTableData } from "../officeEquipment/interface";
import { officeEquipmentMock } from "../../../mocks/officeEquipment";
import { getTableHeaders } from "../../../components/tables/getTableHeaders";
import { crudStates } from "../../../utils/constants";
import { ROUTES } from "../../../core/routes/routes";
import { useNavigate } from "react-router";
import moment from "moment";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { AssetContext } from "../../../context/asset";
import { determineBranchName } from "../../../utils/helpers";

const GeneralAssetUtills = (typeId: string) => {
    const endPoint = 'assets';
    const module = 'General Asset';
    const [open, setOpen] = useState<boolean>(false);
    const [columnHeaders, setColumnHeaders] = useState<Array<ITableHeader>>([] as Array<ITableHeader>);
    const [currentAsset, setCurrentAsset] = useState<IOfficeEquipment>({} as IOfficeEquipment);
    const [generalAssetTableData, setGeneralAssetTableData] = useState<IOfficeEquipmentTableData[]>([] as IOfficeEquipmentTableData[]);
    const [currentState, setCurrentState] = useState<string>("");
    const { options } = useContext(AssetContext);
    const { generalAssets } = useSelector((state: RootState) => state.GeneralAssetStore);
    const navigate = useNavigate();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Build mock row for table header inference
    const {
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
        purchaseCost,
        costOfTheAsset,
        hostname,
        make,
        assetName,
        engravedNumber,
        image,
        ...data
    } = officeEquipmentMock[0];

    const rowData = {
        ...data,
        assetName: "",
        manufacturer: "",
        engravedNumber: "",
        dateReceived: "",
        location: "",
        assignedTo: officeEquipmentMock[0].assignedTo?.firstName,
        status: officeEquipmentMock[0].assetStatus?.name,
        action: {
            label: "options",
            options: options
        },
    };

    useEffect(() => {
        setColumnHeaders(getTableHeaders(rowData));
    }, [options]);

    const determineCurrentAsset = (id: number, list: IOfficeEquipment[]) => {
        return list.find(asset => asset.id === id) as IOfficeEquipment;
    };

    const handleGeneralAssetTableData = (list: Array<IOfficeEquipment>) => {
        const tableData: Array<IOfficeEquipmentTableData> = list.map((item, index) => {
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
                purchaseCost,
                costOfTheAsset,
                hostname,
                make,
                assetName,
                engravedNumber,
                image,
                ...fielsdata
            } = list[index];

            return {
                ...fielsdata,
                assetName: item.assetName,
                engravedNumber: item.engravedNumber,
                dateReceived: moment(item.dateReceipt).format('Do MMMM YYYY'),
                make: item.make,
                status: item?.assetStatus?.status as string,
                assignedTo: item.assignedTo?.firstName
                    ? `${item.assignedTo?.lastName} ${item.assignedTo?.firstName}`
                    : "",
                location: determineBranchName(item),
                manufacturer: item.make,
            };
        });
        setGeneralAssetTableData(tableData);
    };

    const handleOptionClicked = async (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.update:
                navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${typeId}/update/${moduleID}`);
                break;
            case crudStates.read:
                navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${typeId}/view/${moduleID}`);
                break;
            case crudStates.dispose:
                setCurrentAsset(determineCurrentAsset(moduleID as number, generalAssets));
                setCurrentState(crudStates.dispose);
                handleOpen();
                break;
            case crudStates.reassign:
                setCurrentAsset(determineCurrentAsset(moduleID as number, generalAssets));
                setCurrentState(crudStates.reassign);
                handleOpen();
                break;
            case crudStates.repair:
                setCurrentAsset(determineCurrentAsset(moduleID as number, generalAssets));
                setCurrentState(crudStates.repair);
                handleOpen();
                break;
            case crudStates.inStore:
                setCurrentAsset(determineCurrentAsset(moduleID as number, generalAssets));
                setCurrentState(crudStates.inStore);
                handleOpen();
                break;
            default:
                break;
        }
    };

    return {
        endPoint,
        module,
        open,
        columnHeaders,
        handleOpen,
        handleClose,
        currentAsset,
        generalAssetTableData,
        handleGeneralAssetTableData,
        handleOptionClicked,
        currentState,
    };
};

export default GeneralAssetUtills;

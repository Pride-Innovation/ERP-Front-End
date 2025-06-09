/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useState } from "react";
import { fetchStoreDetailsPerBranchService } from "./service";
import { IStore, IStoreReportTableData, IStoresAxiosResponse } from "./interface";
import RoutesUtills from "../../core/routes/utills";
import { StoreContext } from "../../context/store";
import { ITabHeader } from "../../components/tabs/interface";
import { IAssetType } from "../settings/assetTypes/interface";
import TableData from "./TableData";
import { crudStates } from "../../utils/constants";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const StoreUtills = () => {
    const [branchId, setBranchId] = useState<string | number>("")
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { setStoreCommoditiesData } = useContext(StoreContext);
    const [tableHeaders, setTableHeaders] = useState<ITabHeader[]>([] as ITabHeader[]);
    const [currentAssetType, setCurrentAssetType] = useState<ITabHeader>({} as ITabHeader)
    const [storeReportTableData, setStoreReportTableData] = useState<Array<IStoreReportTableData>>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [cureentStoreData, setCurrentStoreData] = useState<IStore>({} as IStore);
    const { stores } = useSelector((state: RootState) => state.StoreStore)
    const [currentState, setCurrentState] = useState<string>('')

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const { getCurrentUser } = RoutesUtills();

    const setCurrentUserBranch = () => {
        setBranchId(getCurrentUser()?.title?.branch?.id as number)
    }

    const fetchStoreDetailsPerBranch = async (id: string | number) => {
        setSendingRequest(true);
        try {
            const response = await fetchStoreDetailsPerBranchService(id) as IStoresAxiosResponse;
            if (response.status === 200) {
                setStoreCommoditiesData(response.data as unknown as IStore[])
            }
        } catch (error) {
            console.log(error)
        }
        setSendingRequest(false)
    }

    const handleTableColumns = (assetTypes: IAssetType[]) => {
        if (assetTypes.length < 1) return [];

        const headers = assetTypes.map((assetType, index) => ({
            label: assetType.name,
            position: index,
            content: <TableData />,
            id: assetType.id
        }))
        setCurrentAssetType(headers[0])
        setTableHeaders(headers)

    }

    const findSingleStore = (id: number): IStore => {
        return stores.find(store => store.id === id) as IStore;
    }

    const handleOptionClicked = (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.read:
                setCurrentState(crudStates.read)
                setCurrentStoreData(findSingleStore(moduleID as number))
                handleOpen()
                break;
            case crudStates.issue:
                setCurrentState(crudStates.issue)
                setCurrentStoreData(findSingleStore(moduleID as number))
                handleOpen()
                break
            default:
                break;
        }

    }

    return ({
        fetchStoreDetailsPerBranch,
        setCurrentUserBranch,
        branchId,
        sendingRequest,
        handleTableColumns,
        tableHeaders,
        currentAssetType,
        setCurrentAssetType,
        setStoreReportTableData,
        storeReportTableData,
        setSendingRequest,
        handleOptionClicked,
        open,
        handleClose,
        currentState
    })
}

export default StoreUtills
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useState } from "react";
import { IStore, IStoresAxiosResponse } from "./interface";
import RoutesUtills from "../../core/routes/utills";
import { StoreContext } from "../../context/store";
import { ITabHeader } from "../../components/tabs/interface";
import { IAssetType } from "../settings/assetTypes/interface";
import TableData from "./TableData";
import { crudStates } from "../../utils/constants";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { IBranchAxiosResponse } from "../settings/branch/interface";
import { fetchSingleBranchService } from "../settings/branch/service";
import { fetchRowsService } from "../../core/apis/globalService";
import { useDispatch } from "react-redux";
import { loadAllStores } from "./slice";

const StoreUtills = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [tableHeaders, setTableHeaders] = useState<ITabHeader[]>([] as ITabHeader[]);
    const [open, setOpen] = useState<boolean>(false);
    const { stores } = useSelector((state: RootState) => state.StoreStore)
    const [currentState, setCurrentState] = useState<string>('')
    const dispatch = useDispatch<AppDispatch>();

    const {
        setCurrentStoreData,
        setBranchId,
        setCurrentAssetType,
        setCurrentBranch,
        branchId,
        currentAssetType,
        setCount
    } = useContext(StoreContext);


    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const { getCurrentUser } = RoutesUtills();

    const setCurrentUserBranch = (id?: number) => {
        if (id) {
            setBranchId(id)
        } else {
            setBranchId(getCurrentUser()?.title?.branch?.id as number)
        }
    }

    const fetchBranchDetails = async (id: number) => {
        try {
            const response = await fetchSingleBranchService(id) as IBranchAxiosResponse
            if (response.status === 200) {
                setCurrentBranch(response.data)
            }

        } catch (error) {
            console.log(error)
        }
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
        return stores.find(store => store.id === id) as IStore;;
    }

    const handleOptionClicked = (option: string | number, moduleID?: string | number) => {
        switch (option) {
            case crudStates.read:
                setCurrentState(crudStates.read)
                setCurrentStoreData(findSingleStore(moduleID as number))
                handleOpen()
                break;
            default:
                break;
        }

    }

    const fetchStoresCommoditiesPerBranchPerAsset = async () => {
        setSendingRequest(true)
        try {
            if (branchId && currentAssetType.id) {
                const params = {
                    branchId,
                    assetTypeId: currentAssetType.id
                }
                const response = await fetchRowsService({
                    pageNumber: 0,
                    pageSize: 10,
                    endPoint: "store",
                    params
                }) as IStoresAxiosResponse;
                if (response.status === 200) {
                    console.log(response.data.content, "Response asset details")
                    dispatch(loadAllStores(response.data.content))
                    setCount(response.data.totalElements)
                }
            }
        } catch (error) {
            console.log(error)
        }
        setSendingRequest(false)

    }

    return ({
        setCurrentUserBranch,
        sendingRequest,
        handleTableColumns,
        tableHeaders,
        setCurrentAssetType,
        setSendingRequest,
        handleOptionClicked,
        open,
        handleClose,
        currentState,
        fetchBranchDetails,
        fetchStoresCommoditiesPerBranchPerAsset
    })
}

export default StoreUtills
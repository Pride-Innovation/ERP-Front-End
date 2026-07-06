/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useState } from "react";
import { ILastIssuedCommodity, IStore, IStoresAxiosResponse } from "./interface";
import RoutesUtills from "../../core/routes/utills";
import { StoreContext } from "../../context/store";
import { ITabHeader } from "../../components/tabs/interface";
import { IAssetType } from "../settings/assetTypes/interface";
import TableData from "./TableData";
import { crudStates } from "../../utils/constants";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { IBranch, IBranchAxiosResponse, IBranchesAxiosResponse } from "../settings/branch/interface";
import { fetchSingleBranchService } from "../settings/branch/service";
import { fetchRowsService } from "../../core/apis/globalService";
import { useDispatch } from "react-redux";
import { loadAllStores } from "./slice";
import { fetchLastIssuedCommodityService } from "./service";

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

    /**
     * Resolves the Head Office branch from the branches directory — the default scope when the
     * logged-in user has no branch of their own (or their cached branch no longer exists).
     */
    const resolveHeadOfficeBranch = async (): Promise<IBranch | null> => {
        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 200,
                endPoint: "branches"
            }) as IBranchesAxiosResponse;
            if (response.status === 200) {
                return (response.data.content ?? []).find((branch) => branch.isHeadOffice) ?? null;
            }
        } catch (error) {
            console.log(error)
        }
        return null;
    }

    const setCurrentUserBranch = async (id?: number) => {
        if (id) {
            setBranchId(id)
            return;
        }
        const userBranchId = getCurrentUser()?.title?.branch?.id;
        if (userBranchId) {
            setBranchId(userBranchId as number)
            return;
        }
        // User has no branch → default the store scope to Head Office.
        const headOffice = await resolveHeadOfficeBranch();
        if (headOffice) {
            setBranchId(headOffice.id as number)
            setCurrentBranch(headOffice)
        }
    }

    const fetchBranchDetails = async (id: number) => {
        try {
            const response = await fetchSingleBranchService(id) as IBranchAxiosResponse
            if (response.status === 200) {
                setCurrentBranch(response.data)
                return;
            }
            // Branch lookup failed (e.g. a stale session pointing at a deleted branch) →
            // fall back to Head Office so the page still loads with a sensible scope.
            // Re-setting an identical branchId is a no-op, so this cannot loop.
            const headOffice = await resolveHeadOfficeBranch();
            if (headOffice) {
                setBranchId(headOffice.id as number)
                setCurrentBranch(headOffice)
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


    const fetchLastIssuedCommodity = async (commodityId: string | number) => {
        try {
            const response = await fetchLastIssuedCommodityService(commodityId) as ILastIssuedCommodity
            if (response.status === 200) {
                console.log(response.data, "Issued Information")
            }
        } catch (error) {
            console.log(error)
        }
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
        fetchStoresCommoditiesPerBranchPerAsset,
        fetchLastIssuedCommodity
    })
}

export default StoreUtills
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useContext, useState } from "react";
import { fetchStoreDetailsPerBranchService } from "./service";
import { IStore, IStoresAxiosResponse } from "./interface";
import RoutesUtills from "../../core/routes/utills";
import { StoreContext } from "../../context/store";
import { ITabHeader } from "../../components/tabs/interface";
import { IAssetType } from "../settings/assetTypes/interface";
import TableData from "./TableData";

const StoreUtills = () => {
    const [branchId, setBranchId] = useState<string | number>("")
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { setStoreCommoditiesData } = useContext(StoreContext);
    const [tableHeaders, setTableHeaders] = useState<ITabHeader[]>([] as ITabHeader[]);
    const [currentAssetType, setCurrentAssetType] = useState<ITabHeader>({} as ITabHeader)


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

    return ({
        fetchStoreDetailsPerBranch,
        setCurrentUserBranch,
        branchId,
        sendingRequest,
        handleTableColumns,
        tableHeaders,
        currentAssetType,
        setCurrentAssetType
    })
}

export default StoreUtills
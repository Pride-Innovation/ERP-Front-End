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

const StoreUtills = () => {
    const [branchId, setBranchId] = useState<string | number>("")
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { setStoreCommoditiesData } = useContext(StoreContext);

    const { getCurrentUser } = RoutesUtills();

    const setCurrentUserBranch = () => {
        setBranchId(getCurrentUser()?.title?.branch?.id as number)
    }

    const fetchStoreDetailsPerBranch = async (id: string | number) => {
        setSendingRequest(true);
        try {
            const response = await fetchStoreDetailsPerBranchService(id) as IStoresAxiosResponse;
            if (response.status === 200) {
                console.log(response.data)
                setStoreCommoditiesData(response.data as unknown as IStore[])
            }
        } catch (error) {
            console.log(error)
        }
        setSendingRequest(false)
    }

    return ({
        fetchStoreDetailsPerBranch,
        setCurrentUserBranch,
        branchId,
        sendingRequest
    })
}

export default StoreUtills
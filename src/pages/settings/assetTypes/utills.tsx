/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import { useDispatch } from "react-redux";
import { fetchRowsService } from "../../../core/apis/globalService"
import { IAssetTypesAxiosResponse } from "./interface";
import { AppDispatch } from "../../../store";
import { loadAllAssetTypes } from "./slice";

const AssetTypeUtills = () => {
    const endPoint: string = "asset-types";
    const dispatch = useDispatch<AppDispatch>();

    const fetchAllAssetTypes = async () => {
        try {
            const response = await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint }) as IAssetTypesAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllAssetTypes(response.data.content))
            }
        } catch (error) {
            console.log(error)
        }
    }
    return ({
        fetchAllAssetTypes
    })
}

export default AssetTypeUtills
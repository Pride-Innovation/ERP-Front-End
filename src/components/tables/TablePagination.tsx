/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { GridPaginationModel } from "@mui/x-data-grid";
import { ICustomTablePagination, IhandleTablePagination } from "./interface";
import { fetchRowsService } from "../../core/apis/globalService";
import { ErrorMessage } from "../../core/apis/axiosInstance";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { loadAllRequests } from "../../pages/request/assetRequest/slice";
import { loadUsers } from "../../pages/users/slice";
import { loadAllInventory } from "../../pages/inventory/slice";
import AssetUtills from "../../pages/assets/Utills";
import { assetTypesStatusConstants } from "../../utils/constants";
import { loadAllFleet } from "../../pages/assets/fleet/slice";
import { loadAllITAssets } from "../../pages/assets/ITEquipment/slice";
import { loadAllOfficeAssets } from "../../pages/assets/officeEquipment/slice";
import { useContext } from "react";
import { AssetContext } from "../../context/asset";


const CustomTablePagination = ({ endPoint, params, selectedStatus }: ICustomTablePagination) => {
    const dispatch = useDispatch<AppDispatch>();
    const { determineAssetTypeState, determineStatusId } = AssetUtills()
    const { fieldName, fieldText } = useContext(AssetContext);

    const handleReduxStoreUpdate = (
        url: string,
        content: Array<Record<string, any>>,
        params?: Record<string, any>
    ) => {
        switch (url) {
            case "requests":
                dispatch(loadAllRequests(content));
                break;
            case "users":
                dispatch(loadUsers(content))
                break;
            case "stocks":
                dispatch(loadAllInventory(content))
                break;
            case "assets":
                const assetType = determineAssetTypeState(params?.assetTypeId);

                if (assetType.name === assetTypesStatusConstants.fleet) {
                    dispatch(loadAllFleet(content))
                }
                if (assetType.name === assetTypesStatusConstants.itEquipment) {
                    dispatch(loadAllITAssets(content))
                }
                if (assetType.name === assetTypesStatusConstants.officeEquipment) {
                    dispatch(loadAllOfficeAssets(content))
                }

                break;
            default:
                break
        }
    }


    const handleTablePagination = async (model: GridPaginationModel) => {
        try {
            const requestParams = fieldName.length > 0 ? ({
                ...params, [fieldName]: fieldText
            }) : params;

            const response = await fetchRowsService({
                pageNumber: model.page,
                pageSize: model.pageSize,
                endPoint,
                params: selectedStatus ? {
                    ...requestParams,
                    assetStatusId: determineStatusId(selectedStatus) // Determine the status ID based on the selected status
                } : requestParams
            }) as IhandleTablePagination;
            const { content } = response.data

            if (content.length > 0) {
                handleReduxStoreUpdate(endPoint, content, params)
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ErrorMessage;
            console.log(errorMessage)
        }

    }
    return ({ handleTablePagination })
}

export default CustomTablePagination;
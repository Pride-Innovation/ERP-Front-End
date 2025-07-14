/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { GridFilterModel } from "@mui/x-data-grid";
import { ICustomTableFilterOperator, IhandleTablePagination } from "./interface";
import { useDebounce } from "../../hooks/useDebounce";
import { useContext, useEffect, useState } from "react";
import { fetchRowsService } from "../../core/apis/globalService";
import { assetTypesStatusConstants, ErrorMessage } from "../../utils/constants";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { loadAllRequests } from "../../pages/request/assetRequest/slice";
import { loadUsers } from "../../pages/users/slice";
import { loadAllInventory } from "../../pages/inventory/slice";
import AssetUtills from "../../pages/assets/Utills";
import { loadAllFleet } from "../../pages/assets/fleet/slice";
import { loadAllITAssets } from "../../pages/assets/ITEquipment/slice";
import { loadAllOfficeAssets } from "../../pages/assets/officeEquipment/slice";
import { RequestContext } from "../../context/request/RequestContext";


const CustomTableFilterOperator = ({ endPoint, params }: ICustomTableFilterOperator) => {
    const [localInput, setLocalInput] = useState<string>('');
    const [fieldName, setFieldName] = useState<string>('');
    const debouncedInput = useDebounce(localInput, 500);
    const dispatch = useDispatch<AppDispatch>();
    const { determineAssetTypeState } = AssetUtills()
    const { setCount } = useContext(RequestContext);

    const handleReduxStoreUpdate = (
        url: string,
        content: Array<Record<string, any>>,
        params?: Record<string, any>
    ) => {
        switch (url) {
            case "requests":
                dispatch(loadAllRequests(content));
                setCount(content.length);
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

    const handleTableFilter = (model: GridFilterModel) => {
        const { items } = model;

        if (items.length > 0) {
            const { field, value } = items[0];
            setLocalInput(value?.toString() || '');
            setFieldName(field);
        }
    };

    const fetchFilteredData = async () => {
        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 10,
                endPoint,
                params: {
                    ...params,
                    [fieldName]: debouncedInput
                }
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

    useEffect(() => {
        if (debouncedInput.length > 0) { fetchFilteredData(); }
    }, [debouncedInput]);

    return {
        handleTableFilter
    };
};

export default CustomTableFilterOperator;

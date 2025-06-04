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


const CustomTablePagination = ({ endPoint }: ICustomTablePagination) => {
    const dispatch = useDispatch<AppDispatch>();

    const handleReduxStoreUpdate = (url: string, content: Array<Record<string, any>>) => {
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
            default:
                break
        }
    }


    const handleTablePagination = async (model: GridPaginationModel) => {
        try {
            const response = await fetchRowsService({
                pageNumber: model.page,
                pageSize: model.pageSize,
                endPoint
            }) as IhandleTablePagination;
            const { content } = response.data

            if (content.length > 0) {
                handleReduxStoreUpdate(endPoint, content)
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ErrorMessage;
            console.log(errorMessage)
        }

    }
    return ({ handleTablePagination })
}

export default CustomTablePagination;
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { GridPaginationModel, GridRowsProp } from "@mui/x-data-grid";
import { ICustomTablePagination } from "./interface";
import { useContext } from "react";
import { fetchRowsService } from "../../core/apis/globalService";
import RowContext from "../../context/row/RowContext";
import { ErrorMessage } from "../../core/apis/axiosInstance";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { loadAllRequests } from "../../pages/request/assetRequest/slice";

const CustomTablePagination = ({ endPoint }: ICustomTablePagination) => {
    const dispatch = useDispatch<AppDispatch>();

    const { setRows } = useContext(RowContext);

    const handleTablePagination = async (model: GridPaginationModel) => {
        console.log(model, "Model Details Point")
        try {
            const response = await fetchRowsService({
                pageNumber: model.page,
                pageSize: model.pageSize,
                endPoint
            }) as any;

            // setRows([...response]);
            dispatch(loadAllRequests(response.data.content));
            console.log(response?.data?.content, "Response Data")
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ErrorMessage;
            console.log(errorMessage)
        }

    }
    /**
     * TO DO
     * handle pagination based on current endpoint. If users, we will have to
     */
    return (
        { handleTablePagination }
    )
}

export default CustomTablePagination;
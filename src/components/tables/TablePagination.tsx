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

const CustomTablePagination = ({ endPoint }: ICustomTablePagination) => {

    const { setRows } = useContext(RowContext);

    const handleTablePagination = async (model: GridPaginationModel) => {
        try {
            const response = await fetchRowsService({
                pageNumber: (model.page + 1),
                pageSize: model.pageSize,
                endPoint
            }) as unknown as GridRowsProp;
            setRows([...response]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ErrorMessage;
            console.log(errorMessage)
        }

    }
    return (
        { handleTablePagination }
    )
}

export default CustomTablePagination;
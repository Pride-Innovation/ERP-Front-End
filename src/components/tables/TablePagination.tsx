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
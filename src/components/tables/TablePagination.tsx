import { GridPaginationModel, GridRowsProp } from "@mui/x-data-grid";
import { ICustomTablePagination } from "./interface";
import { useContext } from "react";
import { fetchRowsService } from "../../core/apis/globalService";
import RowContext from "../../context/row/RowContext";

const CustomTablePagination = ({ endPoint }: ICustomTablePagination) => {

    const { setRows } = useContext(RowContext);

    const handleTablePagination = async (model: GridPaginationModel) => {
        const response = await fetchRowsService({
            page: (model.page + 1),
            size: model.pageSize,
            endPoint
        }) as unknown as GridRowsProp;
        setRows([...response]);
    }
    return (
        { handleTablePagination }
    )
}

export default CustomTablePagination;
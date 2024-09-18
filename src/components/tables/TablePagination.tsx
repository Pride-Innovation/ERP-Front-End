import { GridPaginationModel } from "@mui/x-data-grid";
import { ICustomTablePagination } from "./interface";

const CustomTablePagination = ({ rows }: ICustomTablePagination) => {

    const handleTablePagination = (model: GridPaginationModel) => {
        
        console.log(model, "model!!")
        console.log(rows, "data from pagination!!")
    }
    return (
        { handleTablePagination }
    )
}

export default CustomTablePagination;
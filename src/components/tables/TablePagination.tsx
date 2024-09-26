import { GridPaginationModel } from "@mui/x-data-grid";
import { ICustomTablePagination } from "./interface";
import { ITest } from "../../mocks/trails";
import { useContext } from "react";
import { TestContext } from "../test/TestContext";
import { fetchRowsService } from "../../core/apis/globalService";

const CustomTablePagination = ({ endPoint }: ICustomTablePagination) => {

    const { setTests } = useContext(TestContext);

    const handleTablePagination = async (model: GridPaginationModel) => {
        const response = await fetchRowsService({
            page: (model.page + 1),
            size: model.pageSize,
            endPoint
        }) as unknown as ITest[];
        setTests([...response]);
    }
    return (
        { handleTablePagination }
    )
}

export default CustomTablePagination;
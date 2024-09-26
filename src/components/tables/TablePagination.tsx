import { GridPaginationModel } from "@mui/x-data-grid";
import { ICustomTablePagination } from "./interface";
import { fetchTestData } from "../../pages/test/service";
import { ITest } from "../../mocks/trails";
import { useContext } from "react";
import { TestContext } from "../test/TestContext";

const CustomTablePagination = ({ rows }: ICustomTablePagination) => {

    const { setTests } = useContext(TestContext);

    const handleTablePagination = async (model: GridPaginationModel) => {
        console.log(model, "model!!")
        console.log(rows, "data from pagination!!")

        const response = await fetchTestData({ id: (model.page + 1), size: 10 }) as unknown as ITest[];
        setTests([...response]);
    }
    return (
        { handleTablePagination }
    )
}

export default CustomTablePagination;
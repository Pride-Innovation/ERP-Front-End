import { GridFilterModel, GridRowsProp } from "@mui/x-data-grid";
import { CustomTextFilterOperatorProps } from "./interface";


const CustomTextFilterOperator = ({ rows, setFilteredRows, endPoint }: CustomTextFilterOperatorProps) => {

    const handleTableFilter = (model: GridFilterModel) => {

        const { items } = model;

        // const response = await make api calls(endPoint)
        console.log(endPoint, "endpoint!!")

        if (items.length > 0) {

            const { field, value } = items[0];

            if (value?.length > 0) {
                const filteredRows = rows.filter(row =>
                    row[field]?.toString()?.toLowerCase().includes(value?.toLowerCase())
                ) as GridRowsProp;

                setFilteredRows(filteredRows);

            }
            setFilteredRows(rows as GridRowsProp);

        } else {
            setFilteredRows(rows as GridRowsProp);
        }
    };

    return {
        handleTableFilter
    };
};

export default CustomTextFilterOperator;

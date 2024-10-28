import { ButtonProps } from "@mui/material";
import {
    GridCsvExportMenuItem,
    GridCsvExportOptions,
    GridToolbarExportContainer
} from "@mui/x-data-grid";
import TableUtills from "./utills";

const CustomGridToolbarExport = (props: ButtonProps) => {

    const csvOptions: GridCsvExportOptions = {};
    const { JsonExportMenuItem } = TableUtills();

    return (
        <GridToolbarExportContainer {...props}>
            <GridCsvExportMenuItem options={csvOptions} />
            <JsonExportMenuItem />
        </GridToolbarExportContainer>
    )
}

export default CustomGridToolbarExport;
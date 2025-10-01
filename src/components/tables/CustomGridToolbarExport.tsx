/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ButtonProps } from "@mui/material";
import {
    // GridCsvExportMenuItem,
    // GridCsvExportOptions,
    GridToolbarExportContainer
} from "@mui/x-data-grid";
import TableUtills from "./utills";

interface CustomGridToolbarExportProps extends ButtonProps {
    module?: string;
}

const CustomGridToolbarExport = (props: CustomGridToolbarExportProps) => {

    // const csvOptions: GridCsvExportOptions = {};
    const { JsonExportMenuItem, ExcelExportMenuItem } = TableUtills({ moduleName: props.module });

    return (
        <GridToolbarExportContainer {...props}>
            {/* <GridCsvExportMenuItem options={csvOptions} /> */}
            <ExcelExportMenuItem />
            <JsonExportMenuItem />
        </GridToolbarExportContainer>
    );
}

export default CustomGridToolbarExport;